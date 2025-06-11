// api/EmployerUpdate/route.js
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; 
import jwt from 'jsonwebtoken';
import {connectToDB} from '@/lib/db'; // Adjust path as needed
const User = require('@/models/User'); // Adjust path as needed
const Employer = require('@/models/Employer'); // Adjust path as needed

// Helper function to get user from token or session
async function getCurrentUser(request: NextRequest) {
  try {
    // Try to get user from NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      await connectToDB();
      const user = await User.findOne({ email: session.user.email });
      if (user) return user;
    }

    // If no session, try to get user from JWT token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      
      await connectToDB();
      const user = await User.findById(decoded.userId || decoded.id);
      if (user) return user;
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// GET - Fetch employer profile
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    await connectToDB();

    // Find employer profile by userId
    const employerProfile = await Employer.findOne({ userId: currentUser._id });

    if (!employerProfile) {
      // Return basic user info if no employer profile exists
      return NextResponse.json({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role || 'employer',
        // All other fields will be empty/default
        companyName: '',
        organizationType: '',
        industry: '',
        companySize: '',
        foundedYear: '',
        websiteUrl: '',
        location: '',
        officeAddress: '',
        officialEmail: '',
        phoneNumber: '',
        hrName: '',
        hrDesignation: '',
        hrEmail: '',
        hrLinkedIn: '',
        companyDescription: '',
        missionVision: '',
        companyCulture: ''
      });
    }

    // Return existing employer profile with user info
    return NextResponse.json({
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role || 'employer',
      ...employerProfile.toObject()
    });

  } catch (error) {
    console.error('Error fetching employer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update employer profile
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Extract user-related fields to update User model
    const { name, email, role, ...employerFields } = body;

    await connectToDB();

    // Update user information in User model
    if (name || email || role) {
      const userUpdateData: any = {};
      if (name) userUpdateData.name = name;
      if (email) userUpdateData.email = email;
      if (role) userUpdateData.role = role;
      userUpdateData.updatedAt = new Date();

      await User.findByIdAndUpdate(currentUser._id, userUpdateData, { new: true });
    }

    // Check if employer profile already exists
    let employerProfile = await Employer.findOne({ userId: currentUser._id });

    if (employerProfile) {
      // Update existing employer profile
      const updateData = {
        ...employerFields,
        updatedAt: new Date()
      };

      // Remove empty fields to avoid overwriting with empty strings
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      employerProfile = await Employer.findByIdAndUpdate(
        employerProfile._id,
        updateData,
        { new: true, runValidators: true }
      );

      return NextResponse.json({
        message: 'Employer profile updated successfully',
        profile: employerProfile
      });

    } else {
      // Create new employer profile
      const newEmployerData = {
        userId: currentUser._id,
        companyName: employerFields.companyName || '',
        organizationType: employerFields.organizationType || '',
        industry: employerFields.industry || '',
        companySize: employerFields.companySize || '',
        foundedYear: employerFields.foundedYear || null,
        websiteUrl: employerFields.websiteUrl || '',
        location: employerFields.location || '',
        officeAddress: employerFields.officeAddress || '',
        officialEmail: employerFields.officialEmail || '',
        phoneNumber: employerFields.phoneNumber || '',
        hrName: employerFields.hrName || '',
        hrDesignation: employerFields.hrDesignation || '',
        hrEmail: employerFields.hrEmail || '',
        hrLinkedIn: employerFields.hrLinkedIn || '',
        companyDescription: employerFields.companyDescription || '',
        missionVision: employerFields.missionVision || '',
        companyCulture: employerFields.companyCulture || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Only set required fields if they have values
      if (!newEmployerData.companyName) {
        newEmployerData.companyName = 'Company Name Required';
      }
      if (!newEmployerData.organizationType) {
        newEmployerData.organizationType = 'Organization Type Required';
      }

      employerProfile = await Employer.create(newEmployerData);

      return NextResponse.json({
        message: 'Employer profile created successfully',
        profile: employerProfile
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Error updating employer profile:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: Object.values(error.errors).map((err: any) => err.message)
        },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate entry - User already has an employer profile' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Alternative update method (optional)
export async function PUT(request: NextRequest) {
  return POST(request);
}

// DELETE - Delete employer profile (optional)
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized - User not found' },
        { status: 401 }
      );
    }

    await connectToDB();

    const deletedProfile = await Employer.findOneAndDelete({ userId: currentUser._id });

    if (!deletedProfile) {
      return NextResponse.json(
        { error: 'Employer profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Employer profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting employer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}