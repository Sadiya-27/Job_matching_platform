import { connectToDB } from "@/lib/db";
import Jobseeker from "@/models/Jobseeker";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDB();

    const candidates = await Jobseeker.find()
      .populate("userId", "name email image") // pull name, email, and image from User
      .lean();

    const formatted = candidates.map(candidate => ({
  _id: candidate._id,
  name: candidate.userId?.name || "Unnamed",
  email: candidate.userId?.email || "",
  image: candidate.userId?.image || "/user-avatar.png",
  professionalTitle: candidate.professionalTitle,
  currentJobTitle: candidate.currentJobTitle,
  currentCompany: candidate.currentCompany,
  summary: candidate.summary,
  skills: candidate.skills,
  linkedInUrl: candidate.linkedInUrl,
  githubUrl: candidate.githubUrl,
  portfolioUrl: candidate.portfolioUrl,
  twitterUrl: candidate.twitterUrl,
  resume: candidate.resumeUrl,
  education: candidate.education,
  experience: candidate.experience,
  certification: candidate.certification,
  project: candidate.project,
  totalExperienceYears: candidate.totalExperienceYears,
  totalExperienceMonths: candidate.totalExperienceMonths,
  expectedSalaryMin: candidate.expectedSalaryMin,
  expectedSalaryMax: candidate.expectedSalaryMax,
  expectedSalaryCurrency: candidate.expectedSalaryCurrency,
  noticePeriod: candidate.noticePeriod,
  preferredJobType: candidate.preferredJobType,
  preferredWorkMode: candidate.preferredWorkMode,
  preferredLocations: candidate.preferredLocations,
  industryPreference: candidate.industryPreference,
  willingToRelocate: candidate.willingToRelocate,
  isActivelyLooking: candidate.isActivelyLooking,
  availabilityStatus: candidate.availabilityStatus,
  profileCompletionPercentage: candidate.profileCompletionPercentage,
  appliedAt: candidate.createdAt,
}));


    return new Response(JSON.stringify(formatted), { status: 200 });
  } catch (err: any) {
    console.error("Error fetching candidates:", err.message);
    return new Response("Server error", { status: 500 });
  }
}
