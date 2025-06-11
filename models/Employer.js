// models/Employer.js
const mongoose = require("mongoose");

const EmployerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  organizationType: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
  },
  companySize: {
    type: String,
  },
  foundedYear: {
    type: Number,
  },
  websiteUrl: {
    type: String,
  },
  location: {
    type: String,
  },
  officeAddress: {
    type: String,
  },
  officialEmail: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  hrName: {
    type: String,
  },
  hrDesignation: {
    type: String,
  },
  hrEmail: {
    type: String,
  },
  hrLinkedIn: {
    type: String,
  },
  companyDescription: {
    type: String,
  },
  missionVision: {
    type: String,
  },
  companyCulture: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Employer =
  mongoose.models.Employer || mongoose.model("Employer", EmployerSchema);

module.exports = Employer;
