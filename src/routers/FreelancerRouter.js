const express = require("express");
const router = express.Router();
const FreelancerController = require("../controllers/FreelancerController");

router.post("/applyjob", FreelancerController.ApplyJob);

module.exports = router;
