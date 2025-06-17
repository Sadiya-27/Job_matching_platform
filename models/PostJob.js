// models/PostJob.js
import mongoose from 'mongoose';

const postJobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Remove company field since we'll get it from Employer reference
    location: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote', 'Hybrid'],
      required: true,
    },
    salaryRange: {
      type: String, // Example: "$50,000 - $70,000"
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
    },
    responsibilities: {
      type: [String],
    },
    // Reference to the User model (employer)
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Reference to the Employer model to get company details
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },
    
    deadline: {
      type: Date,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "Open",
        "Interviewing",
      ],
      default: "Open",
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Virtual field to get company name from employer
postJobSchema.virtual('companyName', {
  ref: 'Employer',
  localField: 'employer',
  foreignField: '_id',
  justOne: true,
});


// Ensure virtual fields are serialized
postJobSchema.set('toJSON', { virtuals: true });
postJobSchema.set('toObject', { virtuals: true });

const PostJob = mongoose.models.PostJob || mongoose.model('PostJob', postJobSchema);
export default PostJob;