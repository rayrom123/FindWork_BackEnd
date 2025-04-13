const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");
const { auth, authRole } = require("../middleware/auth");

// Tạo job mới (chỉ employer mới có thể tạo)
router.post("/jobpost", auth, authRole("employer"), JobController.createJob);

module.exports = router;
