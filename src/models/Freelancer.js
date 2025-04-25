const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    username: { type: String, required: true, unique: true }, // Sửa lỗi chính tả và thêm unique
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    fname: { type: String },
    birthday: { type: Date },
    avatar: { type: String },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    education: {
      type: [
        {
          school: String,
          degree: String,
          startDate: String,
          endDate: String,
          description: String,
        },
      ],
      default: [],
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
  { timestamps: true },
);

module.exports = mongoose.model("freelancer", freelancerSchema);
