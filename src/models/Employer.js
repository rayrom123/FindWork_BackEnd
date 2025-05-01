// models/employer.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const employerSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },
  companyLogo: { type: String }, // Đường dẫn tới logo công ty (nếu có)
  contactEmail: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
    unique: true,
  },
  phoneNumber: { type: String }, // Số điện thoại liên hệ
  companyDescription: { type: String }, // Mô tả về công ty
  location: { type: String },

  // rating: {
  //   averageRating: { type: Number, min: 1, max: 5, default: 0 }, // Điểm đánh giá trung bình
  //   totalRatings: { type: Number, default: 0 }, // Tổng số đánh giá
  // },
  // jobPostings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'job' }], // Tham chiếu đến các bài đăng tuyển dụng (Job)
  createdAt: { type: Date, default: Date.now }, // Thời gian tạo hồ sơ
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
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
  phone: String,
  company: String,
  provider: {
    type: String,
    enum: ["local", "facebook", "google"],
    default: "local",
  },
});

const employer = mongoose.model("employer", employerSchema);

module.exports = employer;
