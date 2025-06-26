import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Application from "@/models/Application";

export async function POST(req: Request) {
  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    await connectToDB();

    const count = await Application.countDocuments({ jobId });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to fetch application count:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
