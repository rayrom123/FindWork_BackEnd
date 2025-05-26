const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/ChatController");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.get("/users", auth, ChatController.getAllChattedUsers);
router.post(
    "/send/:id",
    auth,
    upload.single("file"),
    ChatController.sendMessage
);
router.get("/getmessages/:id", auth, ChatController.getMessages); // Get messages between two users

module.exports = router;
