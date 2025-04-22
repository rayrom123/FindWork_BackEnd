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

module.exports = router;
