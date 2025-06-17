import { NextResponse } from "next/server";
import natural from "natural";
import cosineSimilarity from "compute-cosine-similarity";
import mongoose from "mongoose";
import Jobseeker from "@/models/Jobseeker"; // Adjust path if needed

// ✅ Define these at the top
const tokenize = (text: string) => {
  const tokenizer = new natural.WordTokenizer();
  return tokenizer.tokenize(text.toLowerCase());
};

const buildVector = (tokens: string[], vocab: string[]) => {
  const vector = new Array(vocab.length).fill(0);
  tokens.forEach((token) => {
    const index = vocab.indexOf(token);
    if (index !== -1) vector[index]++;
  });
  return vector;
};

// ✅ Your POST handler
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { profile, jobs } = body;

    const jobseeker = await Jobseeker.findOne({
      userId: new mongoose.Types.ObjectId(profile._id),
    });

    if (!jobseeker) {
      return NextResponse.json({ error: "Jobseeker not found" }, { status: 404 });
    }

    const profileText = [
      jobseeker.professionalTitle,
      jobseeker.summary,
      ...(jobseeker.skills || []),
      ...(jobseeker.industryPreference || []),
    ].filter(Boolean).join(" ");

    const profileTokens = tokenize(profileText);

    if (profileTokens.length === 0) {
      return NextResponse.json(
        { error: "Profile is too empty for recommendation" },
        { status: 400 }
      );
    }

    const jobTexts = jobs.map((job) =>
      [job.title, job.description, ...(job.requirements || []), ...(job.responsibilities || [])]
        .filter(Boolean)
        .join(" ")
    );

    const allTokens = [profileTokens, ...jobTexts.map(tokenize)];
    const vocab = Array.from(new Set(allTokens.flat()));
    const profileVector = buildVector(profileTokens, vocab);

    const scoredJobs = jobs.map((job, index) => {
      const jobTokens = tokenize(jobTexts[index]);
      const jobVector = buildVector(jobTokens, vocab);
      const score = cosineSimilarity(profileVector, jobVector);
      return { ...job, score: isNaN(score) ? 0 : score };
    });

    const rankedJobs = scoredJobs
      .filter((job) => job.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return NextResponse.json({ jobs: rankedJobs });
  } catch (err) {
    console.error("Recommendation error:", err);
    return NextResponse.json({ error: "Recommendation failed." }, { status: 500 });
  }
}
