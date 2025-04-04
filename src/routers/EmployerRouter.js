const express = require("express");
const router = express.Router();
const EmployerController = require("../controllers/EmployerController");

router.post("/postjob", EmployerController.PostJob);

module.exports = router;
