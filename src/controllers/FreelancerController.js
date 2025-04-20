const AuthenticateServices = require("../services/AuthenticateServices.js");
const Freelancer = require("../models/Freelancer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const FacebookAuthServices = require("../services/FacebookAuthServices");
const passport = require("passport");
dotenv.config({ path: "./src/.env" });

const createFreelancer = async (req, res) => {
  console.log("Freelancer registration request:", req.body);
  try {
    const { username, password, fname, birthday, phone, experience, email } =
      req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !password || !email) {
      return res.status(400).json({
        status: "Error",
        message: "Username, password and email are required",
      });
    }

    // Thêm role vào dữ liệu trước khi gửi đến service
    const freelancerData = {
      ...req.body,
      role: "freelancer",
    };

    // Gọi service để đăng ký freelancer
    const response =
      await AuthenticateServices.RegisterFreelancer(freelancerData);

    return res.status(200).json({
      status: "Success",
      message: "Freelancer registered successfully",
      data: response,
    });
  } catch (e) {
    console.error("Freelancer registration error:", e);
    return res.status(400).json({
      status: "Error",
      message: e.message || "Registration failed",
    });
  }
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

// Controller for freelancer-related operations
const RegisterFreelancer = (FreelancerData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if username already exists
      const existingUsername = await Freelancer.findOne({
        username: FreelancerData.username,
      });
      if (existingUsername) {
        throw new Error("Username already exists");
      }

      // Check if email already exists
      const existingEmail = await Freelancer.findOne({
        email: FreelancerData.email,
      });
      if (existingEmail) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashPassword = await bcrypt.hash(
        FreelancerData.password,
        saltRounds,
      );
      FreelancerData.password = hashPassword;

      // Create new freelancer
      const newFreelancer = new Freelancer({
        ...FreelancerData,
        project_done: 0,
      });

      // Save freelancer to database
      const savedData = await newFreelancer.save();
      console.log("Saved freelancer data:", savedData);

      resolve(savedData);
    } catch (e) {
      console.error("Freelancer registration error:", e);
      reject(e);
    }
  });
};

// Get freelancer profile
const getFreelancerProfile = (freelancerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find freelancer by ID
      const freelancer = await Freelancer.findById(freelancerId);
      if (!freelancer) {
        throw new Error("Freelancer not found");
      }

      resolve(freelancer);
    } catch (e) {
      console.error("Get freelancer profile error:", e);
      reject(e);
    }
  });
};

// Update freelancer profile
const updateFreelancerProfile = (freelancerId, updateData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find and update freelancer
      const updatedFreelancer = await Freelancer.findByIdAndUpdate(
        freelancerId,
        updateData,
        { new: true },
      );
      if (!updatedFreelancer) {
        throw new Error("Freelancer not found");
      }

      resolve(updatedFreelancer);
    } catch (e) {
      console.error("Update freelancer profile error:", e);
      reject(e);
    }
  });
};

// Delete freelancer account
const deleteFreelancer = (freelancerId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Find and delete freelancer
      const deletedFreelancer =
        await Freelancer.findByIdAndDelete(freelancerId);
      if (!deletedFreelancer) {
        throw new Error("Freelancer not found");
      }

      resolve(deletedFreelancer);
    } catch (e) {
      console.error("Delete freelancer error:", e);
      reject(e);
    }
  });
};

module.exports = {
  createFreelancer,
  login,
  RegisterFreelancer,
  getFreelancerProfile,
  updateFreelancerProfile,
  deleteFreelancer,
  GetProfile,
  facebookLogin,
  facebookCallback,
  checkAuthStatus,
  logout,
};
