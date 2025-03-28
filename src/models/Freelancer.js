const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true }, // Sửa lỗi chính tả và thêm unique
    password: { type: String, required: true },
    fname: { type: String, required: true },
    birthday: { type: Date, required: true },
    image: { type: String, required: true },
    project_done: { type: Number, required: true }, // Thay đổi kiểu dữ liệu
    phone: { type: String, required: true }, // Thay đổi kiểu dữ liệu
    experience: { type: String }, // Thay đổi kiểu dữ liệu
    email: { type: String, required: true, unique: true }, // Thêm trường email
  },
  { timestamps: true },
);

const freelancer = mongoose.model("freelancer", freelancerSchema);

module.exports = freelancer;
