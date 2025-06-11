//fraud-detection/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.text(); // use text() first to handle malformed JSON
    if (!body) {
      console.error("No body provided");
      return NextResponse.json({ isFraud: false }, { status: 400 });
    }

    let jobData;
    try {
      jobData = JSON.parse(body);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return NextResponse.json({ isFraud: false }, { status: 400 });
    }

    const { title, description } = jobData;

    if (!title || !description) {
      console.error("Missing title or description");
      return NextResponse.json({ isFraud: false }, { status: 400 });
    }

    const suspiciousKeywords = [
      "easy money",
      "no experience",
      "investment required",
      "work from home and earn",
      "get rich quick",
      "instant income",
    ];

    const content = (title + " " + description).toLowerCase();

    const isFraud = suspiciousKeywords.some((word) => content.includes(word));

    return NextResponse.json({ isFraud });
  } catch (err) {
    console.error("Error in fraud detection API:", err);
    return NextResponse.json({ isFraud: false }, { status: 500 });
  }
}
