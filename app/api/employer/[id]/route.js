import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Employer from "@/models/Employer";

// GET /api/employer/:id
export async function GET(req, { params }) {
  try {
    await connectToDB();

    const userId = params.id;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    // Match the userId field in Employer with the passed user ID
    const employer = await Employer.findOne({ userId });

    if (!employer) {
      return NextResponse.json({ message: "Employer not found" }, { status: 404 });
    }

    return NextResponse.json({ employer }, { status: 200 });

  } catch (error) {
    console.error("Error fetching employer:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
