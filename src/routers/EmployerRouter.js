const express = require("express");
const router = express.Router();
const passport = require("passport");
const EmployerController = require("../controllers/EmployerController");

// Regular authentication routes
router.post("/employer/register", EmployerController.createEmployer);
router.post("/employer/login", EmployerController.login);

// Facebook authentication routes
router.get("/facebook", EmployerController.facebookLogin);
router.get("/facebook/callback", EmployerController.facebookCallback);

// Check authentication status
router.get("/status", EmployerController.checkAuthStatus);

// Logout route
router.get("/logout", EmployerController.logout);

module.exports = router;
