import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import PostJob from '@/models/PostJob';
import Employer from '@/models/Employer'; // optional: for extra checks
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDB();

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'employer') {
      return NextResponse.json({ error: "Unauthorized – only employers can post jobs" }, { status: 401 });
    }

    const employerId = session.user.id;
    const body = await req.json();

    const {
      title,
      description,
      requirements = [],
      responsibilities = [],
      salaryRange,
      location,
      type,
      deadline,
    } = body;

    // Validation
    if (!title || !description || !location || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newJob = await PostJob.create({
      title,
      description,
      requirements,
      responsibilities,
      salaryRange,
      location,
      type,
      deadline,
      employer: employerId,
    });

    return NextResponse.json({ success: true, job: newJob }, { status: 201 });
  } catch (err) {
    console.error("Job post error:", err);
    return NextResponse.json({ error: "Failed to post job" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();

    const jobs = await PostJob.find().lean();

    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const [employerProfile, userProfile] = await Promise.all([
          Employer.findOne({ userId: job.postedBy }).lean(),
          User.findById(job.employer).lean(),
        ]);

        return {
          ...job,
          employer: {
            companyName: employerProfile?.companyName || 'Unknown',
            userName: userProfile?.name || 'Anonymous',
          },
        };
      })
    );

    return NextResponse.json({ jobs: jobsWithDetails }, { status: 200 });
  } catch (error) {
    console.error('Fetch jobs error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}