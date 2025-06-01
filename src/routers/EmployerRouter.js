const express = require("express");
const router = express.Router();
const passport = require("passport");
const EmployerController = require("../controllers/EmployerController");

router.post("/register", EmployerController.createEmployer);
router.post("/login", EmployerController.login);

module.exports = router;
