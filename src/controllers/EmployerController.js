const AuthenticateServices = require("../services/AuthenticateServices");
const Employer = require("../models/Employer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const FacebookAuthServices = require("../services/FacebookAuthServices");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const crypto = require("crypto");
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
    } = req.body;

    const employerData = {
      ...req.body,
      password: companyPassword,
      role: "employer",
      publicKey: crypto.randomBytes(32).toString("hex"),
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

// Controller for employer-related operations
const RegisterEmployer = (EmployerData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if email already exists
      const existingEmail = await Employer.findOne({
        contactEmail: EmployerData.contactEmail,
      });
      if (existingEmail) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashPassword = await bcrypt.hash(EmployerData.password, saltRounds);
      EmployerData.password = hashPassword;

      // Create new employer
      const newEmployer = new Employer({
        ...EmployerData,
      });

      // Save employer to database
      const savedData = await newEmployer.save();
      console.log("Saved employer data:", savedData);

      resolve(savedData);
    } catch (e) {
      console.error("Employer registration error:", e);
      reject(e);
    }
  });
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

const facebookLogin = (req, res) => {
  req.session.redirectTo = "http://localhost:3001/employer/dashboard";
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
module.exports = {
  createEmployer,
  login,
  RegisterEmployer,
  getEmployerProfile,
  updateEmployerProfile,
  deleteEmployer,
  facebookLogin,
  facebookCallback,
  checkAuthStatus,
  logout,
};
