const express = require("express");
const router = express.Router();
const passport = require("passport");
const EmployerController = require("../controllers/EmployerController");

router.post("/register", EmployerController.createEmployer);
router.post("/login", EmployerController.login);
// Facebook authentication routes
router.get("/facebook", EmployerController.facebookLogin);
router.get("/facebook/callback", EmployerController.facebookCallback);

// Check authentication status
router.get("/status", EmployerController.checkAuthStatus);

// Logout route
router.get("/logout", EmployerController.logout);
module.exports = router;
