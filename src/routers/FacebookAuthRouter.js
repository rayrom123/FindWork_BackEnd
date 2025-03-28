const express = require("express");
const router = express.Router();
const authController = require("../controllers/FacebookAuthController");

// Route để bắt đầu quá trình đăng nhập với Facebook
router.get("/auth/facebook", authController.facebookLogin);

// Route mà Facebook sẽ chuyển hướng người dùng trở lại sau khi họ ủy quyền (hoặc từ chối) ứng dụng
router.get("/auth/facebook/callback", authController.facebookCallback);

module.exports = router;
