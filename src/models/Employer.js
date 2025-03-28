// models/employer.js
const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  companyName: { type: String, required: true, unique: true }, // Tên công ty
  companyPassword: { type: String, required: true },
  companyLogo: { type: String }, // Đường dẫn tới logo công ty (nếu có)
  contactEmail: { type: String, required: true, unique: true }, // Email của nhà tuyển dụng
  phoneNumber: { type: String, required: true }, // Số điện thoại liên hệ
  companyDescription: { type: String }, // Mô tả về công ty
  location: { type: String }, // Vị trí làm việc
  // rating: {
  //   averageRating: { type: Number, min: 1, max: 5, default: 0 }, // Điểm đánh giá trung bình
  //   totalRatings: { type: Number, default: 0 }, // Tổng số đánh giá
  // },
  // jobPostings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'job' }], // Tham chiếu đến các bài đăng tuyển dụng (Job)
  createdAt: { type: Date, default: Date.now }, // Thời gian tạo hồ sơ
});

const employer = mongoose.model("employer", employerSchema);

module.exports = employer;
