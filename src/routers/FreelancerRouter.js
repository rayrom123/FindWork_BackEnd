const express = require("express");
const router = express.Router();
const FreelancerController = require("../controllers/FreelancerController");

router.post("/freelancer/applyjob", FreelancerController.ApplyJob);
router.post("/freelancer/register", FreelancerController.createFreelancer);
router.post("/freelancer/login", FreelancerController.login);
module.exports = router;
