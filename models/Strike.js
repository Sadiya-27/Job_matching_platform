import mongoose from "mongoose";

const StrikeSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
    unique: true, // one strike record per employer
  },
  strikes: {
    type: Number,
    default: 0,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.Strike || mongoose.model("Strike", StrikeSchema);
