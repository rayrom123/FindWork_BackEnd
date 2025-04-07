const express = require("express");
const router = express.Router();
const EmployerController = require("../controllers/EmployerController");
router.post("/employer/register", EmployerController.createEmployer);
router.post("/employer/login", EmployerController.login);

module.exports = router;
