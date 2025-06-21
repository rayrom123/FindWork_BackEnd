const AuthenticateServices = require("../services/AuthenticateServices");
const Employer = require("../models/Employer");
const Freelancer = require("../models/Freelancer");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config({ path: "./src/.env" });

const createEmployer = async (req, res) => {
  console.log("body req", req.body);
  try {
    console.log(req.body);
    const {
      companyName,
      companyPassword,
      companyLogo,
      contactEmail,
      phoneNumber,
      companyDescription,
      location,
      role,
      publicKey,
      encryptedPrivateKey,
    } = req.body;

    const employerData = {
      ...req.body,
      password: companyPassword,
      role: "employer",
      publicKey: publicKey,
      encryptedPrivateKey: encryptedPrivateKey,
    };
    delete employerData.companyPassword;

    if (!companyName || !contactEmail || !companyPassword) {
      return res.status(400).json({
        status: "Error",
        message: "The input is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isCheckMail = emailRegex.test(contactEmail);
    if (!isCheckMail) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid email format",
      });
    }

    const response = await AuthenticateServices.registerEmployer(employerData);
    return res.status(200).json({
      status: "Success",
      message: "Employer registered successfully",
      data: response,
    });
  } catch (e) {
    console.error("Employer registration error:", e);
    return res.status(400).json({
      status: "Error",
      message: e.message || "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Email and password are required",
      });
    }

    const userInfo = await AuthenticateServices.checkLogin(
      email,
      password,
      "employer",
    );

    return res.status(200).json({
      status: "Success",
      message: "Login successful",
      user: userInfo.user,
      access_token: userInfo.access_token,
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(401).json({
      status: "Error",
      message: e.message,
    });
  }
};

// Get employer profile
const getEmployerProfile = (employerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find employer by ID
      const employer = await Employer.findById(employerId);
      if (!employer) {
        throw new Error("Employer not found");
      }

      resolve(employer);
    } catch (e) {
      console.error("Get employer profile error:", e);
      reject(e);
    }
  });
};

// Update employer profile
const updateEmployerProfile = (employerId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find and update employer
      const updatedEmployer = await Employer.findByIdAndUpdate(
        employerId,
        updateData,
        { new: true },
      );
      if (!updatedEmployer) {
        throw new Error("Employer not found");
      }

      resolve(updatedEmployer);
    } catch (e) {
      console.error("Update employer profile error:", e);
      reject(e);
    }
  });
};

// Delete employer account
const deleteEmployer = (employerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find and delete employer
      const deletedEmployer = await Employer.findByIdAndDelete(employerId);
      if (!deletedEmployer) {
        throw new Error("Employer not found");
      }

      resolve(deletedEmployer);
    } catch (e) {
      console.error("Delete employer error:", e);
      reject(e);
    }
  });
};

const getSalarySuggestion = async (req, res) => {
  try {
    const { title, skills, experienceLevel, timeEstimation } = req.body;

    // Validate required fields
    if (!title || !skills || !experienceLevel || !timeEstimation) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const salarySuggestion = await SalarySuggestionService.getSalarySuggestion({
      title,
      skills,
      experienceLevel,
      timeEstimation,
    });

    return res.status(200).json({
      success: true,
      data: salarySuggestion,
    });
  } catch (error) {
    console.error("Error in salary suggestion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate salary suggestion",
    });
  }
};

const getFreelancers = async (req, res) => {
  try {
    const {
      search,
      skills,
      experienceLevel,
      hourlyRate,
      availability,
      page = 1,
      limit = 10,
    } = req.query;

    // Build query
    const query = {};

    // Search by name or bio
    if (search) {
      query.$or = [
        { fname: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(",");
      query.skills = { $in: skillsArray };
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experience = experienceLevel;
    }

    // Filter by hourly rate range
    if (hourlyRate) {
      const [min, max] = hourlyRate.split("-").map(Number);
      query.hourlyRate = {
        $gte: min,
        $lte: max,
      };
    }

    // Filter by availability
    if (availability) {
      query.availability = availability;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const freelancers = await Freelancer.find(query)
      .select("-password -encryptedPrivateKey") // Exclude sensitive data
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Freelancer.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        freelancers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get freelancers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get freelancers",
      error: error.message,
    });
  }
};

const getAISuggestedFreelancers = async (req, res) => {
  try {
    const { title, description, skills, category } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        status: "Error",
        message: "Title and description are required",
      });
    }

    // Get all freelancers from database
    const allFreelancers = await Freelancer.find({}).select(
      "-password -encryptedPrivateKey",
    );

    // Create a detailed prompt with all freelancer information
    const freelancersInfo = allFreelancers.map((freelancer) => ({
      freelancer_id: freelancer._id,
      name: freelancer.fname,
      skills: freelancer.skills,
      experience: freelancer.experience,
      bio: freelancer.bio,
      education: freelancer.education,
    }));

    const prompt = `Dựa trên thông tin công việc sau:
    Tiêu đề: ${title}
    Mô tả: ${description}
    Kỹ năng yêu cầu: ${skills ? skills.join(", ") : "Không yêu cầu kỹ năng cụ thể"}
    Danh mục: ${category || "Không có danh mục"}

    Hãy đề xuất các freelancer phù hợp nhất từ danh sách sau, chỉ trả về json các mã freelancer_id:
    ${JSON.stringify(freelancersInfo, null, 2)}`;

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
        console.log("AI Response:", generatedText);

        // Extract JSON from the response
        const cleanText = generatedText
          .replace(/```json\n?|\n?```/g, "")
          .trim();
        const suggestedFreelancerIds = JSON.parse(cleanText);

        // Find freelancers by their IDs
        const suggestedFreelancers = await Freelancer.find({
          _id: { $in: suggestedFreelancerIds },
        }).select("-password -encryptedPrivateKey");

        return res.status(200).json({
          status: "Success",
          data: {
            freelancers: suggestedFreelancers,
            pagination: {
              total: suggestedFreelancers.length,
              page: 1,
              limit: 10,
              pages: Math.ceil(suggestedFreelancers.length / 10),
            },
          },
        });
      }
    }

    return res.status(200).json({
      status: "Success",
      data: {
        freelancers: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in AI freelancer suggestion:", error);
    return res.status(500).json({
      status: "Error",
      message: "Failed to get AI suggested freelancers",
      error: error.message,
    });
  }
};

module.exports = {
  createEmployer,
  login,
  getEmployerProfile,
  updateEmployerProfile,
  deleteEmployer,
};
