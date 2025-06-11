// /api/user/manual/route.ts
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET || "your_secret_key"; // Replace in production

// ✅ GET: Get current user info from JWT token
export async function GET(req: Request) {
  try {
    await connectToDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or malformed" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, SECRET) as { id: string };
      const user = await User.findById(decoded.id).select("-passwordHash");
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      return NextResponse.json(user);
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Error in /api/user/manual (GET):", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ✅ PUT: Update user profile
export async function PUT(req: Request) {
  try {
    await connectToDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Authorization header missing or malformed" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET) as { id: string };

    const data = await req.json();

    const allowedFields = [
      "name", "companyName", "organizationType", "industry", "companySize",
      "foundedYear", "websiteUrl", "location", "officeAddress", "officialEmail",
      "phoneNumber", "hrName", "hrDesignation", "hrEmail", "hrLinkedIn",
      "companyDescription", "missionVision", "companyCulture"
    ];

    const updates: any = {};
    for (const field of allowedFields) {
      if (field in data) updates[field] = data[field];
    }

    updates.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(decoded.id, updates, { new: true }).select("-passwordHash");
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}

// ✅ POST: Login with email and password
export async function POST(req: Request) {
  try {
    await connectToDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login POST error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
