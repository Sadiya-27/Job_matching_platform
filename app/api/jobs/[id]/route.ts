// src/app/api/jobs/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import PostJob from "@/models/PostJob";
import Employer from "@/models/Employer"; // Not strictly needed here, but good practice
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import User from "@/models/User";
import jwt from 'jsonwebtoken';

// Re-using the same robust helper function to get the current user
async function getCurrentUser(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectToDB();
      const user = await User.findOne({ email: session.user.email });
      if (user) return user;
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      await connectToDB();
      const user = await User.findById(decoded.userId || decoded.id || decoded._id);
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// GET a single job by its ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const job = await PostJob.findById(params.id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    // SECURITY CHECK: Ensure the user requesting the job is the one who posted it.
    if (job.postedBy.toString() !== currentUser._id.toString()) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT (Update) a job
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const job = await PostJob.findById(params.id);

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // CRITICAL SECURITY CHECK: Only the user who posted the job can update it.
    if (job.postedBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Forbidden: You are not authorized to update this job' }, { status: 403 });
    }

    const body = await request.json();

    const updatedJob = await PostJob.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ message: 'Failed to update job', error: error.message }, { status: 500 });
  }
}

// DELETE a job
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    const job = await PostJob.findById(params.id);

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    // CRITICAL SECURITY CHECK: Only the user who posted the job can delete it.
    if (job.postedBy.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ message: 'Forbidden: You are not authorized to delete this job' }, { status: 403 });
    }

    await PostJob.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ message: 'Failed to delete job', error: error.message }, { status: 500 });
  }
}