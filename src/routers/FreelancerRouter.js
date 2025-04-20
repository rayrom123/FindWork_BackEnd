const express = require("express");
const router = express.Router();
const FreelancerController = require("../controllers/FreelancerController");


router.post("/register", FreelancerController.createFreelancer);
router.post("/login", FreelancerController.login);

// Facebook authentication routes
router.get("/facebook", FreelancerController.facebookLogin);
router.get("/facebook/callback", FreelancerController.facebookCallback);
router.get("/status", FreelancerController.checkAuthStatus);
router.get("/logout", FreelancerController.logout);

// Profile routes

router.get("/getprofile", FreelancerController.GetProfile);

module.exports = router;
