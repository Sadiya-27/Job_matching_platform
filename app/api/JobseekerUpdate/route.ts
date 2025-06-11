// api/JobseekerUpdate/route.js
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; 
import jwt from 'jsonwebtoken';
import { connectToDB } from '@/lib/db'; // Adjust path as needed
import User from '@/models/User'; // Adjust path as needed
import Jobseeker from '@/models/Jobseeker';
// Adjust path as needed

// Helper function to get user from token or session
async function getCurrentUser (request: NextRequest) {
  try {
    // Try to get user from NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectToDB();
      return await User.findOne({ email: session.user.email });
    }

    // If no session, try to get user from JWT token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      await connectToDB();
      return await User.findById(decoded.userId || decoded.id);
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// GET - Fetch jobseeker profile
export async function GET(request: NextRequest) {
  try {
    const currentUser  = await getCurrentUser (request);
    
    if (!currentUser ) {
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    await connectToDB();

    // Find jobseeker profile by userId
    const jobseekerProfile = await Jobseeker.findOne({ userId: currentUser ._id });

    if (!jobseekerProfile) {
      // Return basic user info if no jobseeker profile exists
      return NextResponse.json({
        name: currentUser .name,
        email: currentUser .email,
        role: currentUser .role || 'jobseeker',
        phoneNumber: "",
        professionalTitle: "",
        currentJobTitle: "",
        currentCompany: "",
        summary: "",
        skills: [],
        linkedInUrl: "",
        githubUrl: "",
        portfolioUrl: "",
        twitterUrl: "",
        resumeUrl: "",
        education: [],
        experience: [],
        certification: [],
        project: [],
        totalExperienceYears: 0,
        totalExperienceMonths: 0,
        expectedSalaryMin: null,
        expectedSalaryMax: null,
        expectedSalaryCurrency: "INR",
        noticePeriod: "Immediate",
        preferredJobType: "",
        preferredWorkMode: "",
        preferredLocations: [],
        industryPreference: [],
        willingToRelocate: false,
        isActivelyLooking: true,
        availabilityStatus: [],
        profileCompletionPercentage: 0,
      });
    }

    // Return existing jobseeker profile with user info
    return NextResponse.json({
      name: currentUser .name,
      email: currentUser .email,
      role: currentUser .role || 'jobseeker',
      ...jobseekerProfile.toObject()
    });

  } catch (error) {
    console.error('Error fetching jobseeker profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create or update jobseeker profile
export async function POST(request: NextRequest) {
  try {
    const currentUser  = await getCurrentUser (request);

    if (!currentUser ) {
      return NextResponse.json({ error: "Unauthorized - User not found" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, ...jobseekerFields } = body;

    await connectToDB();

    // Update User model if needed
    if (name || email || role) {
      const userUpdateData = {};
      if (name) userUpdateData.name = name;
      if (email) userUpdateData.email = email;
      if (role) userUpdateData.role = role;
      userUpdateData.updatedAt = new Date();

      await User.findByIdAndUpdate(currentUser ._id, userUpdateData, { new: true });
    }

    // Check for existing jobseeker profile
    let jobseekerProfile = await Jobseeker.findOne({ userId: currentUser ._id });

    if (jobseekerProfile) {
      // Update existing jobseeker profile
      const updateData = {
        ...jobseekerFields,
        updatedAt: new Date(),
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      jobseekerProfile = await Jobseeker.findByIdAndUpdate(
        jobseekerProfile._id,
        updateData,
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        message: "Jobseeker profile updated successfully",
        profile: jobseekerProfile,
      });
    } else {
      // Create new jobseeker profile
      const newJobseekerData = {
        userId: currentUser ._id,
        ...jobseekerFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newProfile = await Jobseeker.create(newJobseekerData);

      return NextResponse.json(
        {
          message: "Jobseeker profile created successfully",
          profile: newProfile,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error updating jobseeker profile:", error);

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: "Validation error",
          details: Object.values(error.errors).map((err) => err.message),
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        {
          error: "Duplicate entry - User already has a jobseeker profile",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete jobseeker profile
export async function DELETE(request: NextRequest) {
  try {
    const currentUser  = await getCurrentUser (request);
    
    if (!currentUser ) {
      return NextResponse.json({ error: 'Unauthorized - User not found' }, { status: 401 });
    }

    await connectToDB();

    const deletedProfile = await Jobseeker.findOneAndDelete({ userId: currentUser ._id });

    if (!deletedProfile) {
      return NextResponse.json({ error: 'Jobseeker profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Jobseeker profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting jobseeker profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
