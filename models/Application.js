// models/Application.js

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostJob",
      required: true,
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or 'Jobseeker' depending on your setup
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    resumeLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "under review",
        "accepted",
        "rejected",
        "called for interview",
        "joined",
      ],
      default: "submitted",
    },
    interviewDate: {
      type: Date, // Optional
    },
    interviewTime: {
      type: String, // or Date if you're storing full Date objects
      required: false,
    },
    interviewLocation: {
      type: String,
    },
    joiningDate: {
      type: Date, // Optional
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
