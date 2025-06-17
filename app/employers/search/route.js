import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';

export async function GET(request) {
  try {
    await connectToDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query || query.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    const employers = await User.find({
      email: { $regex: query, $options: 'i' },
      role: "employer"
    })
      .select("name email userImage _id")
      .limit(10);

    const formatted = employers.map((user) => ({
      id: user._id.toString(), // TalkJS expects `id`
      name: user.name,
      email: user.email,
      photoUrl: user.userImage || null, // Optional, TalkJS uses `photoUrl`
      role: "employer", // Optional, for your logic
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Employer search error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
