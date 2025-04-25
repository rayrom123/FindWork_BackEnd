const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/ChatController");
const { auth } = require("../middleware/auth");

router.get("/users", auth, ChatController.getAllChattedUsers);
router.post("/send/:id", auth, ChatController.sendMessage);
router.get("/getmessages/:id", auth, ChatController.getMessages); // Get messages between two users

module.exports = router;