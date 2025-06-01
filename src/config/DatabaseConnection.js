// config/dbConnection.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = { connectDB }; // Export connectDB
