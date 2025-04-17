const mongoose = require("mongoose");
const { Schema } = mongoose;

const ApplicationSchema = new Schema({
  freelancerId: {
    type: Schema.Types.ObjectId,
    ref: "Freelancer",
    required: true,
  },
  jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  proposalText: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", ApplicationSchema);
