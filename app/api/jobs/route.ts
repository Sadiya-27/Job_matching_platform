// api/jobs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import PostJob from "@/models/PostJob";
import Employer from "@/models/Employer";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import User from "@/models/User";
import jwt from "jsonwebtoken";

async function getCurrentUser(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectToDB();
      const user = await User.findOne({ email: session.user.email });
      if (user) return user;
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      await connectToDB();

      const user = await User.findById(
        decoded._id || decoded.id || decoded.userId
      );
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  await connectToDB();

  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const userId = currentUser._id;

    // Find employer by userId
    const employer = await Employer.findOne({ userId: userId });
    if (!employer) {
      return NextResponse.json(
        {
          message:
            "Employer profile not found for the authenticated user. Please complete your profile.",
        },
        { status: 404 }
      );
    }

    // Create the job post with company from Employer
    const newJob = await PostJob.create({
      ...body,
      postedBy: userId,
      company: employer.companyName,
    });

    return NextResponse.json(newJob, { status: 201 });
  } catch (err: any) {
    console.error("Error creating job:", err.message);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDB();

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized - User not found" },
        { status: 401 }
      );
    }

    const filter: any = { postedBy: currentUser._id };

    const jobs = await PostJob.find(filter)
      .populate({
        path: "postedBy",
        select: "name email role",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(jobs, { status: 200 });
  } catch (error: any) {
    console.error("Failed to fetch jobs:", error.message);
    return NextResponse.json(
      { message: "Error fetching jobs", error: error.message },
      { status: 500 }
    );
  }
}
