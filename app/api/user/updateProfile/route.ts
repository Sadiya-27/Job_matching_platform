import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function PUT(req: NextRequest) {
  try {
    await connectToDB();
    const { userImage } = await req.json();

    // 1. Try to get session user
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    // 2. Or get from token (manual auth)
    if (!userId) {
      const token = req.headers.get("authorization")?.replace("Bearer ", "");
      if (token) {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        userId = decoded.id;
      }
    }

    if (!userId || !userImage) {
      return NextResponse.json({ error: "Missing userId or image" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { userImage } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
