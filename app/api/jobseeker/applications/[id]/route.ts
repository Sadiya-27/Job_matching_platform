// app/api/jobseeker/applications/[id]/route.ts

import { connectToDB } from "@/lib/db";
import Application from "@/models/Application";
import PostJob from "@/models/PostJob";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDB();

    const applications = await Application.find({ applicantId: params.id })
      .populate({
        path: "jobId",
        model: "PostJob",
        populate: {
          path: "employer",
          select: "companyName",
        },
      })
      .lean();

    return new Response(JSON.stringify(applications), { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch applications" }), {
      status: 500,
    });
  }
}
