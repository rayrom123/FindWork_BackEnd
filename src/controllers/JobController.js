const JobService = require("../services/JobService");

// Controller for job-related operations
const createJob = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("User creating job:", req.user);

    const {
      title,
      description,
      minSalary,
      maxSalary,
      timeEstimation,
      experienceLevel,
      location,
      skills,
    } = req.body;

    // Log field values for debugging
    console.log("Fields check:", {
      title: title,
      description: description,
      minSalary: minSalary,
      maxSalary: maxSalary,
      timeEstimation: timeEstimation,
      experienceLevel: experienceLevel,
      location: location,
      skills: skills,
    });

    // Validate required fields
    if (
      !title ||
      !description ||
      !minSalary ||
      !maxSalary ||
      !timeEstimation ||
      !experienceLevel ||
      !location ||
      !skills
    ) {
      return res.status(400).json({
        status: "Error",
        message: "All fields are required",
        missingFields: {
          title: !title,
          description: !description,
          minSalary: !minSalary,
          maxSalary: !maxSalary,
          timeEstimation: !timeEstimation,
          experienceLevel: !experienceLevel,
          location: !location,
          skills: !skills,
        },
      });
    }

    // Validate salary range
    if (minSalary >= maxSalary) {
      return res.status(400).json({
        status: "Error",
        message: "maxSalary must be greater than minSalary",
      });
    }

    // Validate skills format
    if (!Array.isArray(skills)) {
      return res.status(400).json({
        status: "Error",
        message: "Skills must be an array",
      });
    }

    // Prepare job data
    const jobData = {
      title,
      description,
      minSalary,
      maxSalary,
      timeEstimation,
      experienceLevel,
      location,
      skills,
      employerId: req.user._id,
    };

    // Create job using service
    const savedJob = await JobService.createJob(jobData);

    return res.status(201).json({
      status: "Success",
      message: "Job created successfully",
      data: savedJob,
    });
  } catch (e) {
    console.error("Error creating job:", e);
    return res.status(400).json({
      status: "Error",
      message: e.message || "Failed to create job",
      error: e,
    });
  }
};

// Get jobs with filters
const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      minSalary,
      maxSalary,
      experienceLevel,
      timeEstimation,
      skills,
      sort = "newest",
    } = req.query;

    const filters = {
      page: Number(page),
      limit: Number(limit),
      search,
      location,
      minSalary,
      maxSalary,
      experienceLevel,
      timeEstimation,
      skills: skills ? skills.split(",") : undefined,
      sort,
    };

    const response = await JobService.getJobs(filters);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error getting jobs:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to get jobs",
    });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await JobService.getJobById(id);

    return res.status(200).json({
      status: "Success",
      data: job,
    });
  } catch (error) {
    console.error("Error getting job:", error);
    return res.status(404).json({
      status: "Error",
      message: error.message || "Job not found",
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Kiểm tra quyền sở hữu job
    const job = await JobService.getJobById(id);
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "Error",
        message: "You don't have permission to update this job",
      });
    }

    const updatedJob = await JobService.updateJob(id, updateData);

    return res.status(200).json({
      status: "Success",
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to update job",
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền sở hữu job
    const job = await JobService.getJobById(id);
    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "Error",
        message: "You don't have permission to delete this job",
      });
    }

    await JobService.deleteJob(id);

    return res.status(200).json({
      status: "Success",
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to delete job",
    });
  }
};

// Apply for a job
const applyJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { proposalText, bidAmount } = req.body;
    const freelancerId = req.user._id;

    const application = await JobService.applyJob(
      freelancerId,
      id,
      proposalText,
      bidAmount,
    );

    return res.status(201).json({
      status: "Success",
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    const status = error.statusCode || 400;
    return res.status(status).json({
      status: "Error",
      message: error.message || "Failed to apply for job",
    });
  }
};

// Get applied jobs
const getAppliedJobs = async (req, res) => {
  try {
    const freelancerId = req.user._id;
    const applications = await JobService.getAppliedJobs(freelancerId);

    return res.status(200).json({
      status: "Success",
      data: applications,
    });
  } catch (error) {
    console.error("Error getting applied jobs:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to get applied jobs",
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyJob,
  getAppliedJobs,
};
