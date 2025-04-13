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

module.exports = {
  createJob,
};
