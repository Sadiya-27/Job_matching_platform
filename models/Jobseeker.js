import mongoose from "mongoose";

const JobseekerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    phoneNumber: { type: String },
    professionalTitle: { type: String },
    currentJobTitle: { type: String },
    currentCompany: { type: String },
    summary: { type: String },
    skills: [{ type: String }],
    linkedInUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    twitterUrl: { type: String },
    resumeUrl: { type: String },

    // Education stored as array of simple objects
    education: [
      {
        degree: String,
        fieldOfStudy: String,
        institution: String,
        startDate: Date,
        endDate: Date,
        cgpa: Number,
        percentage: Number,
        isCurrentlyStudying: Boolean,
      },
    ],

    // Experience stored as array of simple objects
    experience: [
      {
        jobTitle: String,
        companyName: String,
        location: String,
        startDate: Date,
        endDate: Date,
        isCurrentJob: Boolean,
        description: String,
        achievements: [String],
      },
    ],

    certification: [
      {
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        expirationDate: Date,
        credentialId: String,
        credentialUrl: String,
        doesNotExpire: Boolean,
      },
    ],

    project: [
      {
        title: String,
        description: String,
        technologies: [String],
        projectUrl: String,
        githubUrl: String,
        startDate: Date,
        endDate: Date,
        isOngoing: Boolean,
      },
    ],


    totalExperienceYears: { type: Number, default: 0 },
    totalExperienceMonths: { type: Number, default: 0 },

    expectedSalaryMin: { type: Number },
    expectedSalaryMax: { type: Number },
    expectedSalaryCurrency: { type: String, default: "INR" },

    noticePeriod: { type: String },
    preferredJobType: { type: String },
    preferredWorkMode: { type: String },

    preferredLocations: [{ type: String }],
    industryPreference: [{ type: String }],
    willingToRelocate: { type: Boolean, default: false },
    isActivelyLooking: { type: Boolean, default: true },
    availabilityStatus: [{ type: String }],

    profileCompletionPercentage: { type: Number, default: 0 },
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
 });

const Jobseeker =
  mongoose.models.Jobseeker || mongoose.model("Jobseeker", JobseekerSchema);

export default Jobseeker;
