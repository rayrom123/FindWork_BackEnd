const express = require("express");
const router = express.Router();
const FreelancerController = require("../controllers/FreelancerController");

router.post("/register", FreelancerController.createFreelancer);
router.post("/login", FreelancerController.login);
router.get("/getprofile", FreelancerController.GetProfile);

module.exports = router;
