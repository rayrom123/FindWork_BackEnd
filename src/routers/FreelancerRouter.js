const express = require("express");
const router = express.Router();
const FreelancerController = require("../controllers/FreelancerController");

router.post("/freelancer/register", FreelancerController.createFreelancer);
router.post("/freelancer/login", FreelancerController.login);
router.get("/getprofile", FreelancerController.GetProfile);

module.exports = router;
