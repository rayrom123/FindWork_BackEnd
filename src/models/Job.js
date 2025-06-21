const mongoose = require("mongoose");

// Define job schema
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  minSalary: {
    type: Number,
    required: true,
  },
  maxSalary: {
    type: Number,
    required: true,
  },
  timeEstimation: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employer",
    required: true,
  },
  appliedFreelancers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "freelancer",
      default: [],
    },
  ],
  status: {
    type: String,
    enum: ["Open", "Closed"],
    default: "Open",
  },
  pay: {
    type: Boolean,
    default: false,
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

// Create and export Job model
const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
