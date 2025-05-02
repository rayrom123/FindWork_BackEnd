const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config({ path: "./src/.env" });

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

  // Login employer
  static async loginEmployer(email, password) {
    try {
      const user = await Employer.findOne({ contactEmail: email });
      if (!user) {
        throw new Error("Invalid email");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { user_id: user._id, role: "employer" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return {
        access_token: token,
        user: {
          ...user.toObject(),
          role: "employer",
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Login freelancer
  static async loginFreelancer(email, password) {
    try {
      const user = await Freelancer.findOne({ email: email });
      if (!user) {
        throw new Error("Invalid email");
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        { user_id: user._id, role: "freelancer" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      return {
        access_token: token,
        user: {
          ...user.toObject(),
          role: "freelancer",
        },
      };
    } catch (e) {
      throw e;
    }
  }

  // Check login credentials
  static async checkLogin(email, password, role) {
    try {
      if (role === "employer") {
        return await this.loginEmployer(email, password);
      } else if (role === "freelancer") {
        return await this.loginFreelancer(email, password);
      } else {
        throw new Error("Invalid role");
      }
    } catch (e) {
      throw e;
    }
  }
}
module.exports = AuthenticateServices;
