import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db'; // Ensure this connects to MongoDB
import Application from '@/models/Application';
import PostJob from '@/models/PostJob';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; // Adjust the path

export async function GET(req) {
  try {
    await connectToDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");

    let applications;

    if (jobId) {
      // Fetch applications for one job
      applications = await Application.find({ jobId })
        .populate('jobId', 'title')
        .populate('applicantId', 'name email');
    } else {
      // Fetch applications for all jobs by this employer
      const jobs = await PostJob.find({ postedBy: session.user._id }).select('_id');
      const jobIds = jobs.map((job) => job._id);

      applications = await Application.find({ jobId: { $in: jobIds } })
        .populate('jobId', 'title')
        .populate('applicantId', 'name email');
    }

    return NextResponse.json({ applications }, { status: 200 });
  } catch (err) {
    console.error("Application fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

