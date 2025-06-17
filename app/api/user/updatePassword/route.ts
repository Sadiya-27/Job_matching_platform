import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    const { userId, oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
  return NextResponse.json({ error: "Missing oldPassword or newPassword" }, { status: 400 });
}


    await connectToDB();

    const user = await User.findById(userId);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "User not found or password not set" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 401 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = newHash;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
