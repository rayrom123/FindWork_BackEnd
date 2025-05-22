const AuthenticateServices = require("../services/AuthenticateServices.js");
const Freelancer = require("../models/Freelancer");
const Job = require("../models/Job");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const FacebookAuthServices = require("../services/FacebookAuthServices");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
dotenv.config({ path: "./src/.env" });

// Cấu hình multer cho việc upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/avatars/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (validTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG"),
        false,
      );
    }
  },
}).single("avatar");

const createFreelancer = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        status: "Error",
        message: err.message,
      });
    }

    try {
      const {
        username,
        password,
        fname,
        birthday,
        phone,
        experience,
        email,
        location,
      } = req.body;
      const avatar = req.file ? req.file.path.replace(/\\/g, "/") : null;

      // Kiểm tra các trường bắt buộc
      if (!username || !password || !email) {
        return res.status(400).json({
          status: "Error",
          message: "Username, password and email are required",
        });
      }

      const freelancerData = {
        username,
        password,
        fname,
        birthday,
        phone,
        experience,
        email,
        location: location || null,
        avatar,
      };

      // Sử dụng AuthService để đăng ký freelancer
      const { freelancer, token } =
        await AuthenticateServices.registerFreelancer(freelancerData);

      return res.status(200).json({
        status: "Success",
        message: "Freelancer registered successfully",
        data: freelancer,
        token,
      });
    } catch (e) {
      console.error("Freelancer registration error:", e);
      return res.status(400).json({
        status: "Error",
        message: e.message || "Registration failed",
      });
    }
  });
};

const GetProfile = async (req, res) => {
  try {
    const { freelancerId } = req.query;
    if (!freelancerId) {
      return res.status(400).json({
        status: "Error",
        message: "Freelancer ID is required",
      });
    }

    const freelancer =
      await Freelancer.findById(freelancerId).select("-password");
    if (!freelancer) {
      return res.status(404).json({
        status: "Error",
        message: "Freelancer not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      data: freelancer,
    });
  } catch (e) {
    return res.status(400).json({
      status: "Error",
      message: e.message || "Failed to get profile",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Email and password are required",
      });
    }

    const userInfo = await AuthenticateServices.checkLogin(
      email,
      password,
      "freelancer",
    );
    return res.status(200).json({
      status: "Success",
      message: "Login successful",
      user: userInfo.user,
      access_token: userInfo.access_token,
    });
  } catch (error) {
    return res.status(401).json({
      status: "Error",
      message: error.message,
    });
  }
};

const facebookLogin = (req, res) => {
  req.session.redirectTo = "http://localhost:3001/freelancer/dashboard";
  passport.authenticate("facebook", { scope: ["email"] })(req, res);
};

const facebookCallback = (req, res, next) => {
  FacebookAuthServices.handleFacebookCallback(req, res, next);
};

const checkAuthStatus = (req, res) => {
  FacebookAuthServices.checkAuthStatus(req, res);
};

const logout = (req, res) => {
  FacebookAuthServices.handleLogout(req, res);
};

// Update freelancer profile
const updateProfile = async (req, res) => {
  try {
    const freelancerId = req.user._id;
    const updateData = req.body;

    // Kiểm tra xem freelancer có tồn tại không
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({
        status: "Error",
        message: "Freelancer not found",
      });
    }

    // Cập nhật thông tin
    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      freelancerId,
      {
        $set: {
          fname: updateData.name,
          phone: updateData.phone,
          location: updateData.location,
          skills: updateData.skills,
          experience: updateData.experience,
          education: updateData.education,
          bio: updateData.bio,
        },
      },
      { new: true },
    );

    // Loại bỏ password trước khi gửi response
    const { password, ...freelancerWithoutPassword } =
      updatedFreelancer.toObject();

    return res.status(200).json({
      status: "Success",
      message: "Profile updated successfully",
      data: freelancerWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to update profile",
    });
  }
};

const recommendJobsForFreelancer = async (req, res) => {
  try {
    const { freelancer_id } = req.body;
    const freelancer = await Freelancer.findOne({ freelancer_id });

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found." });
    }

    // Get all jobs from database
    const allJobs = await Job.find({});

    let skillsText = "";
    // Lấy skills từ freelancer hiện tại (đã xác thực)
    if (req.user.skills && req.user.skills.length > 0) {
      skillsText = req.user.skills.join(", ");
    } else {
      skillsText = "không có kỹ năng cụ thể";
    }
    console.log("skillsText:", skillsText);
    // Create a detailed prompt with all job information
    const jobsInfo = allJobs.map((job) => ({
      job_id: job._id,
      title: job.title,
      required_skills: job.skills,
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      timeEstimation: job.timeEstimation,
      experienceLevel: job.experienceLevel,
      location: job.location,
    }));

    const prompt = `Dựa trên các kỹ năng sau của freelancer: ${skillsText}. 
    Hãy đề xuất tất cả công việc phù hợp nhất từ danh sách công việc sau, chỉ trả về json các mã job_id:
    ${JSON.stringify(jobsInfo, null, 2)}`;

    const PALM_API_URL = process.env.PALM_API_URL;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    };

    //console.log("PaLM API URL:", PALM_API_URL);
    const response = await axios.post(PALM_API_URL, requestBody);
    const predictions = response.data.candidates;
    if (predictions && predictions.length > 0) {
      const firstCandidate = predictions[0];
      if (
        firstCandidate.content &&
        firstCandidate.content.parts &&
        firstCandidate.content.parts.length > 0
      ) {
        const generatedText = firstCandidate.content.parts[0].text;
        //console.log("noi dung prompt: ", prompt);
        console.log("Nội dung AI đã trả về:", generatedText);

        // Extract JSON from the response
        let predictedJobIds = [];
        try {
          // Remove markdown code block markers if present
          const cleanText = generatedText
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          predictedJobIds = JSON.parse(cleanText);
          console.log("Predicted Job IDs:", predictedJobIds);
        } catch (e) {
          console.error("Error parsing JSON from AI response:", e);
          return res.status(500).json({
            message: "Failed to parse AI response",
            error: e.message,
            rawResponse: generatedText,
          });
        }

        // Find jobs by their IDs - select all fields
        const recommendedJobs = await Job.find({
          _id: { $in: predictedJobIds },
        });

        if (!recommendedJobs || recommendedJobs.length === 0) {
          return res.status(404).json({
            message: "No recommended jobs found for the given IDs",
            predictedJobIds: predictedJobIds,
          });
        }

        return res.status(200).json({
          message: "Recommended jobs fetched successfully.",
          predictedJobIds: predictedJobIds,
          data: recommendedJobs.map((job) => ({
            _id: job._id,
            title: job.title,
            description: job.description
              ? job.description.substring(0, 150) + "..."
              : "",
            skills: job.skills,
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            timeEstimation: job.timeEstimation,
            experienceLevel: job.experienceLevel,
            location: job.location,
            status: job.status,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
          })),
        });
      }
    }

    return res.status(200).json({
      message: "No response candidates from the AI.",
      data: [],
    });
  } catch (error) {
    console.error(
      "Error recommending jobs with prompt:",
      error.response ? error.response.data : error.message,
    );
    return res.status(500).json({
      message: "Failed to get job recommendations using prompt.",
      error: error.message,
    });
  }
};

/**
 * Đề xuất freelancer cho một công việc cụ thể.
 * Yêu cầu: job_id trong body.
 * API AI sẽ nhận thông tin công việc và trả về danh sách freelancer_id được đề xuất.
 */

module.exports = {
  createFreelancer,
  login,
  GetProfile,
  updateProfile,
  facebookLogin,
  facebookCallback,
  checkAuthStatus,
  logout,
  recommendJobsForFreelancer,
};
