const Job = require("../models/Job");
const Application = require("../models/Applications");
const axios = require("axios");
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

  // Get jobs with filters and pagination
  static async getJobs(filters) {
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
      } = filters;

      // Validate pagination parameters
      const pageNumber = Math.max(1, parseInt(page));
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit)));

      const matchStage = { status: "Open" };

      // Build search conditions
      if (search) {
        matchStage.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      if (location) {
        matchStage.location = { $regex: location, $options: "i" };
      }

      if (experienceLevel) {
        matchStage.experienceLevel = experienceLevel;
      }

      if (timeEstimation) {
        matchStage.timeEstimation = timeEstimation;
      }

      // Filter by salary range
      if (minSalary || maxSalary) {
        matchStage.minSalary = {};
        matchStage.maxSalary = {};

        if (minSalary) {
          matchStage.maxSalary.$gte = parseInt(minSalary);
        }

        if (maxSalary) {
          matchStage.minSalary.$lte = parseInt(maxSalary);
        }
      }

      // Filter by skills
      if (skills && skills.length > 0) {
        matchStage.skills = { $in: skills };
      }

      // Build sort options
      let sortOption = { createdAt: -1 };
      switch (sort) {
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        case "salary-desc":
          sortOption = { maxSalary: -1 };
          break;
        case "salary-asc":
          sortOption = { minSalary: 1 };
          break;
        case "newest":
        default:
          sortOption = { createdAt: -1 };
      }

      const skip = (pageNumber - 1) * limitNumber;

      const [total, jobs] = await Promise.all([
        Job.countDocuments(matchStage),
        Job.aggregate([
          { $match: matchStage },
          { $sort: sortOption },
          { $skip: skip },
          { $limit: limitNumber },
          {
            $lookup: {
              from: "employers",
              localField: "employerId",
              foreignField: "_id",
              as: "employer",
            },
          },
          { $unwind: "$employer" },
          {
            $project: {
              _id: 1,
              title: 1,
              description: 1,
              minSalary: 1,
              maxSalary: 1,
              location: 1,
              experienceLevel: 1,
              timeEstimation: 1,
              skills: 1,
              status: 1,
              pay: 1,
              createdAt: 1,
              updatedAt: 1,
              "employer.companyName": 1,
              "employer._id": 1,
              "employer.image": 1,
            },
          },
        ]),
      ]);

      return {
        jobs,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
          hasNextPage: pageNumber < Math.ceil(total / limitNumber),
          hasPrevPage: pageNumber > 1,
          nextPage:
            pageNumber < Math.ceil(total / limitNumber) ? pageNumber + 1 : null,
          prevPage: pageNumber > 1 ? pageNumber - 1 : null,
        },
      };
    } catch (e) {
      console.error("Error getting jobs:", e);
      throw e;
    }
  }

  // Get job by ID
  static async getJobById(jobId) {
    try {
      const job = await Job.findById(jobId)
        .populate("employerId", "companyName image")
        .lean();

      if (!job) {
        throw new Error("Job not found");
      }

      return job;
    } catch (e) {
      console.error("Error getting job by ID:", e);
      throw e;
    }
  }

  static async getJobsByEmployer(employerId) {
    try {
      console.log("Getting jobs for employerId:", employerId);
      const jobs = await Job.find({ employerId });
      console.log("Found jobs:", jobs);
      return jobs;
    } catch (e) {
      console.error("Error getting jobs:", e);
      throw e;
    }
  }

  // Update job
  static async updateJob(jobId, updateData) {
    try {
      const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, {
        new: true,
      });

      if (!updatedJob) {
        throw new Error("Job not found");
      }

      return updatedJob;
    } catch (e) {
      console.error("Error updating job:", e);
      throw e;
    }
  }

  // Delete job
  static async deleteJob(jobId) {
    try {
      const deletedJob = await Job.findByIdAndDelete(jobId);

      if (!deletedJob) {
        throw new Error("Job not found");
      }

      return deletedJob;
    } catch (e) {
      console.error("Error deleting job:", e);
      throw e;
    }
  }

  // Apply for a job
  static async applyJob(freelancerId, jobId, proposalText, bidAmount) {
    try {
      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error("Job not found");
      }

      // Check if already applied
      const existingApp = await Application.findOne({ freelancerId, jobId });
      if (existingApp) {
        throw new Error("You have already applied to this job");
      }

      // Create new application
      const application = new Application({
        freelancerId,
        jobId,
        proposalText,
        bidAmount,
        status: "pending",
      });

      await application.save();
      return application;
    } catch (e) {
      console.error("Error applying for job:", e);
      throw e;
    }
  }

  // Get applied jobs for a freelancer
  static async getAppliedJobs(freelancerId) {
    try {
      const applications = await Application.find({ freelancerId })
        .populate({
          path: "jobId",
          select: "title description minSalary maxSalary location status",
          populate: {
            path: "employerId",
            select: "companyName image",
          },
        })
        .lean();

      return applications;
    } catch (e) {
      console.error("Error getting applied jobs:", e);
      throw e;
    }
  }

  static async generateAccessToken() {
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
      data: "grant_type=client_credentials",
    });
    return response.data.access_token;
  }

  static async createOrder(jobId) {
    // Tìm application đã accepted
    const application = await Application.findOne({
      jobId,
    });
    if (!application)
      throw new Error("Không tìm thấy đơn ứng tuyển đã được chấp nhận");
    const accessToken = await JobService.generateAccessToken();
    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v2/checkout/orders",
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: application.bidAmount.toString(),
            },
          },
        ],
        application_context: {
          return_url: `https://web-fe-deploy.vercel.app/payment/return?jobId=${jobId}`,
          cancel_url: "https://web-fe-deploy.vercel.app/employer/dashboard",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    // Lấy approvalUrl từ response
    const approvalUrl = response.data.links.find(
      (link) => link.rel === "approve",
    )?.href;
    return { approvalUrl };
  }

  static async captureOrder(jobID) {
    const access_token = await JobService.generateAccessToken();
    const response = await axios.post(
      `https://api-m.sandbox.paypal.com/v2/checkout/orders/${jobID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }
}

module.exports = JobService;
