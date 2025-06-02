const AuthenticateServices = require("../services/AuthenticateServices");
const Employer = require("../models/Employer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
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

module.exports = {
  createEmployer,
  login,
  getEmployerProfile,
  updateEmployerProfile,
  deleteEmployer,
};
