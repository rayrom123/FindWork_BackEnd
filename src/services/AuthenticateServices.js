const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config({ path: "./src/config/.env" });

// Check if JWT secret exists
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

// Service for authentication operations
class AuthenticateServices {
  // Register a new employer
  static async registerEmployer(employerData) {
    try {
      // Check if email already exists
      const existingEmployer = await Employer.findOne({
        contactEmail: employerData.contactEmail,
      });
      if (existingEmployer) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(employerData.password, 10);

      // Create new employer
      const employer = new Employer({
        ...employerData,
        password: hashedPassword,
      });

      // Save employer to database
      await employer.save();

      // Generate JWT token
      const token = jwt.sign(
        { user_id: employer._id, role: "employer" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return {
        access_token: token,
        user: {
          ...employer.toObject(),
          role: "employer",
        },
      };
    } catch (e) {
      throw e;
    }
  }

  // Register a new freelancer
  static async registerFreelancer(freelancerData) {
    try {
      // Check if email already exists
      const existingFreelancer = await Freelancer.findOne({
        email: freelancerData.email,
      });
      if (existingFreelancer) {
        throw new Error("Email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(freelancerData.password, 10);

      // Create new freelancer
      const freelancer = new Freelancer({
        ...freelancerData,
        password: hashedPassword,
      });

      // Save freelancer to database
      await freelancer.save();

      // Generate JWT token
      const token = jwt.sign(
        { user_id: freelancer._id, role: "freelancer" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return {
        access_token: token,
        user: {
          ...freelancer.toObject(),
          role: "freelancer",
        },
      };
    } catch (e) {
      throw e;
    }
  }

  // Login user (employer or freelancer)
  static async login(email, password, role) {
    try {
      // Find user based on role
      let user;
      if (role === "employer") {
        user = await Employer.findOne({ contactEmail: email });
      } else if (role === "freelancer") {
        user = await Freelancer.findOne({ email: email });
      }

      // Check if user exists
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user._id, role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      // Return data in format expected by frontend
      return {
        access_token: token,
        user: {
          ...user.toObject(),
          role: role,
        },
      };
    } catch (e) {
      throw e;
    }
  }
}

module.exports = AuthenticateServices;
