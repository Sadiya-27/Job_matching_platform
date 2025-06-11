// api/employer/strike/[employerId]/route.js

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Strike from "@/models/Strike";

// GET: Get strike count and block status
export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { employerId } = params;

    let record = await Strike.findOne({ employer: employerId });

    if (!record) {
      // Create if not exists with 0 strikes
      record = await Strike.create({ employer: employerId, strikes: 0 });
    }

    return NextResponse.json({ strikes: record.strikes, isBlocked: record.isBlocked });
  } catch (error) {
    console.error("GET strike error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Add a strike
export async function POST(req, { params }) {
  try {
    await connectToDB();
    const { employerId } = params;

    let record = await Strike.findOne({ employer: employerId });

    if (!record) {
      record = new Strike({ employer: employerId, strikes: 1 });
    } else {
      record.strikes += 1;
      if (record.strikes >= 3) {
        record.isBlocked = true;
      }
    }

    await record.save();

    return NextResponse.json({
      message: "Strike recorded",
      strikes: record.strikes,
      isBlocked: record.isBlocked,
    });
  } catch (error) {
    console.error("POST strike error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
