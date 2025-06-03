const express = require("express");
const router = express.Router();
const passport = require("passport");
const EmployerController = require("../controllers/EmployerController");

router.post("/register", EmployerController.createEmployer);
router.post("/login", EmployerController.login);

// Salary suggestion route
router.post("/salary-suggestion", EmployerController.getSalarySuggestion);

// Get freelancers route
router.get("/GetFreelancers", EmployerController.getFreelancers);

// AI suggested freelancers route
router.post(
  "/ai-suggest-freelancers",
  EmployerController.getAISuggestedFreelancers,
);
module.exports = router;
