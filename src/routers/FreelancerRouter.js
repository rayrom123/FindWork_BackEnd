const express = require("express");
const router = express.Router();
const FreelancerController = require("../controllers/FreelancerController");
const { auth, authRole } = require("../middleware/auth");

// Routes
router.post("/register", FreelancerController.createFreelancer);
router.post("/login", FreelancerController.login);
router.get(
  "/profile",
  auth,
  authRole("freelancer"),
  FreelancerController.GetProfile,
);
router.put(
  "/profile",
  auth,
  authRole("freelancer"),
  FreelancerController.updateProfile,
);

router.post(
  "/recommend/jobs-for-freelancer",
  auth, // Yêu cầu xác thực
  authRole("freelancer"), // Chỉ freelancer mới có thể yêu cầu đề xuất cho mình
  FreelancerController.recommendJobsForFreelancer,
);

module.exports = router;
