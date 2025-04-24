const mongoose = require("mongoose");


const freelancerSchema = new mongoose.Schema(
  {
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: { type: String, required: true, unique: true }, // Sửa lỗi chính tả và thêm unique
    password: { type: String, required: true },
    fname: { type: String },
    birthday: { type: Date },
    avatar: { type: String },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: { 
      type: [{
        school: String,
        degree: String,
        startDate: String,
        endDate: String,
        description: String
      }], 
      default: [] 
    },
    project_done: { type: Number }, // Thay đổi kiểu dữ liệu
    phone: { type: String }, // Thay đổi kiểu dữ liệu
    experience: { type: String }, // Thay đổi kiểu dữ liệu
    provider: {
      type: String,
      enum: ["local", "facebook"],
      default: "local",
    },
    email: { type: String, required: true, unique: true }, // Thêm trường email và unique
    location: { type: String },

  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fname: String,
  birthday: Date,
  image: String,
  avatar: String,
  project_done: {
    type: Number,
    default: 0,
  },
  phone: String,
  experience: String,
  provider: {
    type: String,
    enum: ["local", "facebook"],
    default: "local",
  },
});

module.exports = mongoose.model("Freelancer", FreelancerSchema);
