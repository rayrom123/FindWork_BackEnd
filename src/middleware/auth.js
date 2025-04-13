const jwt = require("jsonwebtoken");
const Employer = require("../models/Employer");
const Freelancer = require("../models/Freelancer");

// Middleware to verify JWT token and attach user to request
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Received token:", token);

    if (!token) {
      return res.status(401).json({
        status: "Error",
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Find user based on role
    let user;
    if (decoded.role === "employer") {
      user = await Employer.findById(decoded.user_id);
      console.log("Found employer:", user);
    } else if (decoded.role === "freelancer") {
      user = await Freelancer.findById(decoded.user_id);
      console.log("Found freelancer:", user);
    }

    if (!user) {
      return res.status(401).json({
        status: "Error",
        message: "User not found",
      });
    }

    // Attach user and role to request
    req.user = user;
    req.user.role = decoded.role;
    req.token = token;
    next();
  } catch (e) {
    console.error("Auth error:", e);
    return res.status(401).json({
      status: "Error",
      message: "Invalid token",
    });
  }
};

// Middleware to check user role
const authRole = (role) => {
  return (req, res, next) => {
    // Check if user has required role
    if (req.user.role !== role) {
      return res.status(403).json({
        status: "Error",
        message: "Access denied",
      });
    }
    next();
  };
};

module.exports = {
  auth,
  authRole,
};
