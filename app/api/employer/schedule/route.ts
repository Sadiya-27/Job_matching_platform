import { connectToDB } from "@/lib/db";
import Application from "@/models/Application";
import PostJob from "@/models/PostJob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const { employerId } = await req.json();

    // Get all jobs posted by this employer
    const jobs = await PostJob.find({ employer: employerId });

    const jobIds = jobs.map((job) => job._id);

    // Get applications with interviewDate or joiningDate
    const applications = await Application.find({
      jobId: { $in: jobIds },
      $or: [{ interviewDate: { $ne: null } }, { joiningDate: { $ne: null } }],
    });

    // Format application-based events (without time field)
    const appEvents = applications
      .map((app) => {
        if (app.interviewDate) {
          return {
            date: app.interviewDate,
            title: `Interview with ${app.name}`,
            time: app.interviewTime || null,
            location: app.interviewLocation || null,
          };
        } else if (app.joiningDate) {
          return {
            date: app.joiningDate,
            title: `${app.name} joins`,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Format job deadline events
    const jobEvents = jobs
      .filter((job) => job.deadline)
      .map((job) => ({
        date: job.deadline,
        title: `Deadline for ${job.title}`,
      }));

    // Combine and sort the schedule
    const schedule = [...appEvents, ...jobEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({ schedule });
  } catch (err) {
    console.error("Failed to fetch schedule", err);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
