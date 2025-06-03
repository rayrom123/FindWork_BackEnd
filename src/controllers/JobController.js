const Job = require("../models/Job");
const JobService = require("../services/JobService");
const Application = require("../models/Applications");
const Freelancer = require("../models/Freelancer");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config({ path: "./src/.env" });

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
      category
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
      category: category,
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
      !skills ||
      !category
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
          category: !category,
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
      category,
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
      category,
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
      category,
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

const getJobsByEmployer = async (req, res) => {
  try {
    console.log("User from token:", req.user);
    const employerId = req.user._id;
    console.log("Looking for jobs with employerId:", employerId);

    const jobs = await JobService.getJobsByEmployer(employerId);
    console.log("Found jobs:", jobs);

    res.json(jobs);
  } catch (e) {
    console.error("Error in getJobsByEmployer:", e);
    res.status(400).json({ error: e.message });
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
const createOrder = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { freelancerId } = req.body;
    
    console.log(
      "[PayPal Create Order] Starting create order process for job:",
      jobId,
      "and freelancer:",
      freelancerId
    );

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("[PayPal Create Order] Error: Job not found for ID:", jobId);
      return res.status(404).json({
        status: "Error",
        message: "Job not found",
      });
    }

    const order = await JobService.createOrder(jobId, freelancerId);
    console.log("[PayPal Create Order] Order created successfully:", order);

    return res.status(200).json({
      status: "Success",
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error("[PayPal Create Order] Error creating order:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message || "Failed to create PayPal order",
    });
  }
};
const captureOrder = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { orderId, freelancerId } = req.body;

    console.log("[PayPal Capture] Starting capture process", {
      orderId,
      jobId,
      freelancerId,
      body: req.body,
      params: req.params,
    });

    // Validate orderId and freelancerId
    if (!orderId || !freelancerId) {
      console.log(
        "[PayPal Capture] Error: Order ID or Freelancer ID is missing in request body",
      );
      return res.status(400).json({
        status: "Error",
        message: "Order ID and Freelancer ID are required in request body",
      });
    }

    // Check if job exists before capturing payment
    console.log("[PayPal Capture] Looking up job:", jobId);
    const job = await Job.findById(jobId);
    if (!job) {
      console.log("[PayPal Capture] Error: Job not found for ID:", jobId);
      return res.status(404).json({
        status: "Error",
        message: "Job not found",
      });
    }
    console.log("[PayPal Capture] Found job:", {
      jobId: job._id,
      title: job.title,
      status: job.status,
    });

    // Capture PayPal payment
    console.log(
      "[PayPal Capture] Attempting to capture PayPal payment for order:",
      orderId,
    );
    const captureData = await JobService.captureOrder(orderId);
    console.log("[PayPal Capture] PayPal capture response:", captureData);

    if (captureData.status === "COMPLETED") {
      console.log(
        "[PayPal Capture] Payment completed successfully, updating job and application status",
      );

      // Update application status and payment - Find the specific application for this freelancer
      const application = await Application.findOne({ jobId, freelancerId });
      if (application) {
        application.status = "accepted";
        application.pay = true;
        await application.save();
        console.log("[PayPal Capture] Updated application status:", {
          applicationId: application._id,
          newStatus: application.status,
          pay: application.pay,
        });

        // Add freelancer to job's appliedFreelancers if not already present
        if (!job.appliedFreelancers.includes(freelancerId)) {
          job.appliedFreelancers.push(freelancerId);
          await job.save();
          console.log(
            "[PayPal Capture] Added freelancer to job's appliedFreelancers:",
            {
              jobId: job._id,
              freelancerId: freelancerId,
            },
          );
        } else {
          console.log(
            "[PayPal Capture] Freelancer already in appliedFreelancers:",
            {
              jobId: job._id,
              freelancerId: freelancerId,
            },
          );
        }
      } else {
        console.log("[PayPal Capture] No application found for job and freelancer:", { jobId, freelancerId });
      }

      return res.status(200).json({
        status: "Success",
        message: "Payment captured successfully",
        data: {
          job: job,
          application: application,
        },
      });
    } else {
      console.log(
        "[PayPal Capture] Error: Payment not completed. Status:",
        captureData.status,
      );
      return res.status(400).json({
        status: "Error",
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("[PayPal Capture] Error capturing order:", error);
    console.error("[PayPal Capture] Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      status: "Error",
      message: error.message || "Failed to capture payment",
    });
  }
};
// Get applied freelancers for a specific job
const getProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user._id;

    console.log("Job ID:", id);
    console.log("Employer ID:", employerId);

    // Kiểm tra xem job có thuộc về employer này không
    const job = await Job.findById(id);
    console.log("Found job:", job);

    if (!job) {
      return res.status(404).json({
        status: "Error",
        message: "Job not found",
      });
    }

    if (job.employerId.toString() !== employerId.toString()) {
      return res.status(403).json({
        status: "Error",
        message: "You don't have permission to view applications for this job",
      });
    }

    // Lấy tất cả applications cho job này và populate toàn bộ thông tin freelancer
    const applications = await Application.find({ jobId: id })
      .populate("freelancerId")
      .sort({ createdAt: -1 });

    console.log("Found applications:", applications);

    return res.status(200).json({
      status: "Success",
      data: {
        job: {
          title: job.title,
          description: job.description,
          status: job.status,
        },
        applications: applications.map((app) => ({
          id: app._id,
          freelancer: app.freelancerId,
          proposalText: app.proposalText,
          bidAmount: app.bidAmount,
          status: app.status,
          appliedAt: app.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting applied job:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to get job applications",
    });
  }
};

// Reject a proposal
const rejectProposal = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const employerId = req.user._id;

    // Tìm application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        status: "Error",
        message: "Application not found",
      });
    }

    // Tìm job tương ứng
    const job = await Job.findById(application.jobId);

    if (!job) {
      return res.status(404).json({
        status: "Error",
        message: "Job not found",
      });
    }

    // Kiểm tra quyền (chỉ employer của job mới có thể từ chối)
    if (job.employerId.toString() !== employerId.toString()) {
      return res.status(403).json({
        status: "Error",
        message: "You don't have permission to reject this proposal",
      });
    }

    // Cập nhật trạng thái thành rejected
    application.status = "rejected";
    await application.save();

    return res.status(200).json({
      status: "Success",
      message: "Proposal rejected successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error rejecting proposal:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to reject proposal",
    });
  }
};

// Accept a proposal
const acceptProposal = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const employerId = req.user._id;

    // Tìm application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        status: "Error",
        message: "Application not found",
      });
    }

    // Tìm job tương ứng
    const job = await Job.findById(application.jobId);

    if (!job) {
      return res.status(404).json({
        status: "Error",
        message: "Job not found",
      });
    }

    // Kiểm tra quyền (chỉ employer của job mới có thể chấp nhận)
    if (job.employerId.toString() !== employerId.toString()) {
      return res.status(403).json({
        status: "Error",
        message: "You don't have permission to accept this proposal",
      });
    }

    // Cập nhật trạng thái thành accepted
    application.status = "accepted";
    await application.save();

    return res.status(200).json({
      status: "Success",
      message: "Proposal accepted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Error accepting proposal:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to accept proposal",
    });
  }
};

const checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      console.log("[PayPal Order Status] Error: Order ID is missing");
      return res.status(400).json({
        status: 'Error',
        message: 'Order ID is required'
      });
    }

    console.log("[PayPal Order Status] Checking status for order:", orderId);
    const accessToken = await JobService.generateAccessToken();
    const response = await axios.get(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("[PayPal Order Status] Order status:", response.data.status);
    return res.status(200).json({
      status: 'Success',
      data: response.data
    });
  } catch (error) {
    console.error('[PayPal Order Status] Error:', error);
    return res.status(500).json({
      status: 'Error',
      message: error.message || 'Failed to check order status'
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
  getJobsByEmployer,
  getProposal,
  rejectProposal,
  acceptProposal,
  createOrder,
  captureOrder,
  checkOrderStatus,
};
