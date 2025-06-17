// /api/job/updateStatus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import PostJob from "@/models/PostJob";

export async function PUT(req: NextRequest) {
  try {
    const { jobId, status } = await req.json();
    await connectToDB();
    const job = await PostJob.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });

    return NextResponse.json({ message: "Status updated", job });
  } catch (error) {
    return NextResponse.json({ message: "Error updating job status", error }, { status: 500 });
  }
}
