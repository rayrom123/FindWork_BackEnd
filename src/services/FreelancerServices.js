const Job = require("../models/job");

const ApplyJob = async (jobData) => {
  try {
    const apply = await Job.findByIdAndUpdate(
      jobData.jobId, // Tìm Job theo JobID
      { $push: { appliedFreelancers: jobData.freelancerId } }, // Cập nhật employerId
      { new: true }, // Trả về document đã được cập nhật
    );
    console.log("Updated job:", apply);
    return apply;
  } catch (error) {
    console.error("Error updating job:", error);
    throw error;
  }
};

module.exports = {
  ApplyJob,
};
