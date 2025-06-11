// api/user/me/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your_secret_key"; // Store this in .env in production

export async function GET(req: Request) {
  try {
    // Connect to the database
    await connectToDB();

    // 1. Check for NextAuth session (for social login)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email }).select("-passwordHash");
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      return NextResponse.json(user);
    }

    // 2. Check for manual JWT token in the Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

      try {
        // Verify the JWT token
        const decoded = jwt.verify(token, SECRET) as { id: string };

        // Find the user by the decoded ID
        const user = await User.findById(decoded.id).select("-passwordHash");
        if (!user) {
          return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json(user);
      } catch (err) {
        return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
      }
    }

    // If no session or JWT token, return unauthorized response
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  } catch (error) {
    console.error("Error in /api/user/me:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


// ✅ PUT: Update current user details
export async function PUT(req: Request) {
  try {
    await connectToDB();

    let user: any = null;

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      user = await User.findOne({ email: session.user.email });
    } else {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, SECRET) as { id: string };
        user = await User.findById(decoded.id);
      }
    }

    if (!user) {
      return NextResponse.json({ message: "Unauthorized or user not found" }, { status: 401 });
    }

    const data = await req.json();

    const allowedFields = [
      "name", "companyName", "organizationType", "industry", "companySize",
      "foundedYear", "websiteUrl", "location", "officeAddress", "officialEmail",
      "phoneNumber", "hrName", "hrDesignation", "hrEmail", "hrLinkedIn",
      "companyDescription", "missionVision", "companyCulture"
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        user[field] = data[field];
      }
    }

    user.updatedAt = new Date();
    await user.save();

    const updatedUser = await User.findById(user._id).select("-passwordHash");
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error in /api/user/me PUT:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}