import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User"; // Ensure path is correct

export async function POST(req) {
  try {
    const { name, email } = await req.json();

    // Ensure email is provided
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log("MongoDB not connected, attempting connection...");
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected successfully");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Create new user if doesn't exist
      const newUser = new User({
        name,
        email,
        passwordHash: "", // Optional for OAuth users
        role: "jobseeker",
      });

      await newUser.save();
      console.log("New user created:", email);
    } else {
      console.log("User already exists:", email);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user:", error.message);
    return NextResponse.json({ error: "Server error, please try again later." }, { status: 500 });
  }
}
