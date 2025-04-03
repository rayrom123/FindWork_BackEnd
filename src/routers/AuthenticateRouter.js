const express = require("express");
const router = express.Router();
const EmployerController = require("../controllers/EmployerController");
const FreelancerController = require("../controllers/FreelancerController");
router.post("/employer/register", EmployerController.createEmployer),
  router.post("/employer/login", EmployerController.login);
router.post("/freelancer/register", FreelancerController.createFreelancer);
router.post("/freelancer/login", FreelancerController.login);
module.exports = router;
