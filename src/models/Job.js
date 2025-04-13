const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  minSalary: { type: Number, required: true },
  maxSalary: { type: Number, required: true },
  timeEstimation: { type: String, required: true },
  experienceLevel: { type: String, required: true },
  location: { type: String, required: true },
  skills: { type: [String], required: true },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employer",
    required: true,
  },
  status: { type: String, enum: ["Open", "Closed"], default: "Open" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Job = mongoose.model("job", jobSchema);

module.exports = Job;
