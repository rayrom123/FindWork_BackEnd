// config/dbConnection.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config({ path: "./src/config/.env" });
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

module.exports = { connectDB }; // Export connectDB
