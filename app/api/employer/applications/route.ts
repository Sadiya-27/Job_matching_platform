// api/employer/applications/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import Application from '@/models/Application';
import PostJob from '@/models/PostJob';
import Jobseeker from '@/models/Jobseeker';
import Employer from '@/models/Employer';

export async function POST(req) {
  try {
    await connectToDB();

    const { employerId, jobId } = await req.json();

    const jobsQuery = jobId ? { _id: jobId, employer: employerId } : { employer: employerId };

    const jobs = await PostJob.find(jobsQuery);
    const jobIds = jobs.map(job => job._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title')
      .populate('applicantId');

    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        const jobseekerProfile = await Jobseeker.findOne({ userId: app.applicantId._id });
        return {
          _id: app._id,
          name: app.name,
          email: app.email,
          resumeLink: app.resumeLink,
          status: app.status,
          jobTitle: app.jobId.title,
          jobId: app.jobId._id,
          applicantId: app.applicantId._id,
          interviewDate: app.interviewDate,
          interviewTime: app.interviewTime,
          joiningDate: app.joiningDate,
          appliedAt: app.appliedAt,
          jobseekerProfile,
        };
      })
    );

    return NextResponse.json({ applications: applicationsWithProfiles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}