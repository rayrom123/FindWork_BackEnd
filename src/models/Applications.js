const mongoose = require("mongoose");
const Freelancer = require("./Freelancer");

const applicationSchema = new mongoose.Schema(
  {
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "freelancer",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    proposalText: {
      type: String,
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    pay: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;
