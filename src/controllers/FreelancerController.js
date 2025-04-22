const AuthenticateServices = require("../services/AuthenticateServices.js");
const Freelancer = require("../models/Freelancer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const FacebookAuthServices = require("../services/FacebookAuthServices");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
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

      // Thêm role vào dữ liệu trước khi gửi đến service
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
const updateFreelancerProfile = async (req, res) => {
  try {
    const { freelancerId } = req.params;
    const updateData = req.body;

    // Kiểm tra định dạng avatar nếu có
    if (updateData.avatar) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(updateData.avatar.type)) {
        return res.status(400).json({
          status: "Error",
          message: "Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG",
        });
      }
    }

    const updatedFreelancer = await Freelancer.findByIdAndUpdate(
      freelancerId,
      updateData,
      { new: true },
    );

    if (!updatedFreelancer) {
      return res.status(404).json({
        status: "Error",
        message: "Freelancer not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Profile updated successfully",
      data: updatedFreelancer,
    });
  } catch (error) {
    console.error("Update freelancer profile error:", error);
    return res.status(400).json({
      status: "Error",
      message: error.message || "Failed to update profile",
    });
  }
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

module.exports = {
  createFreelancer,
  login,
  RegisterFreelancer,
  getFreelancerProfile,
  updateFreelancerProfile,
  deleteFreelancer,
  GetProfile,
  updateProfile,
  facebookLogin,
  facebookCallback,
  checkAuthStatus,
  logout,
};
