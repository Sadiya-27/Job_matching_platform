// api/user/register/route.ts
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your_secret_key"; // Replace with real secret in production

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { name, email, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      role,
      passwordHash,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ id: newUser._id }, SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    }, { status: 201 });

  } catch (error) {
    console.error("Manual registration error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
