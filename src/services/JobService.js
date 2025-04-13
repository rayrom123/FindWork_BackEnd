const Job = require("../models/Job");

// Service for job-related operations
class JobService {
  // Create a new job posting
  static async createJob(jobData) {
    try {
      console.log("Job data to save:", jobData);

      // Create and save new job
      const newJob = new Job(jobData);
      const savedJob = await newJob.save();

      console.log("Saved job:", savedJob);
      return savedJob;
    } catch (e) {
      console.error("Error creating job:", e);
      throw e;
    }
  }
}

module.exports = JobService;
