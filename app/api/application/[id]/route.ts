// app/api/application/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import PostJob from '@/models/PostJob';
import Application from '@/models/Application';

// GET /api/application/:id
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();

    const job = await PostJob.findById(params.id).populate('employer', 'companyName websiteUrl');

    if (!job) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return NextResponse.json({ message: 'Failed to fetch job' }, { status: 500 });
  }
}

// POST /api/application/:id
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDB();

    const body = await req.json();
    const { name, email, resumeLink, applicantId } = body;

    if (!name || !email || !resumeLink || !applicantId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const jobExists = await PostJob.findById(params.id);
    if (!jobExists) {
      return NextResponse.json({ message: 'Job not found' }, { status: 404 });
    }

    const application = await Application.create({
      jobId: params.id,
      name,
      email,
      resumeLink,
      applicantId,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ message: 'Failed to submit application' }, { status: 500 });
  }
}

// PUT /api/applications/:id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    const data = await req.json();

    const {
      status,
      interviewDate,
      interviewTime,
      interviewLocation,
      joiningDate,
    } = data;

    const updatedApp = await Application.findByIdAndUpdate(
      params.id,
      {
        ...(status && { status }),
        ...(interviewDate && { interviewDate }),
        ...(interviewTime && { interviewTime }),
        ...(interviewLocation && { interviewLocation }),
        ...(joiningDate && { joiningDate }),
      },
      { new: true }
    );

    if (!updatedApp) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(updatedApp, { status: 200 });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json({ message: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();
    await Application.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ message: "Application deleted" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete" }), {
      status: 500,
    });
  }
}
