const AuthenticateServices = require("../services/AuthenticateServices.js");
const Freelancer = require("../models/Freelancer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
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
      await AuthenticateServices.registerFreelancer(freelancerData);

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

module.exports = {
  createFreelancer,
  login,
  GetProfile,
};
