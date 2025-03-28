const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String },
    salary: { type: Number },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: "freelancer" }, // Tham chiếu đến User (Employer)
  },
  { timestamps: true },
);

const job = mongoose("job", jobSchema);
module.exports = job;
