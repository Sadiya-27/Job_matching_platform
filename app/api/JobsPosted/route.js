// app/api/JobsPosted/route.js
import { connectToDB } from "@/lib/db"; // Adjust path if needed
import PostJob from "@/models/PostJob";
import Employer from "@/models/Employer";

export async function GET() {
  try {
    await connectToDB();
    const jobs = await PostJob.find()
      .populate("employer", "companyName") // Populate company name
      .sort({ createdAt: -1 }); // Optional: show latest jobs first

    return new Response(JSON.stringify(jobs), { status: 200 });
  } catch (error) {
    return new Response("Failed to fetch jobs", { status: 500 });
  }
}
