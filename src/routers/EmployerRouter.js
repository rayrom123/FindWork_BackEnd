const express = require("express");
const router = express.Router();
const EmployerController = require("../controllers/EmployerController");
router.post("/employer/register", EmployerController.createEmployer);
router.post("/employer/login", EmployerController.login);
router.post("/employer/postjob", EmployerController.PostJob);

module.exports = router;
