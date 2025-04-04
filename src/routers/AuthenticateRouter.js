const express = require("express");
const router = express.Router();

const AuthenticateController = require("../controllers/AuthenticateController");

router.post("/register/employer", AuthenticateController.RegisterEmployer),
router.post("/register/freelancer", AuthenticateController.RegisterFreelancer);

router.post("/login/employer", AuthenticateController.LoginEmployer);
router.post("/login/freelancer", AuthenticateController.LoginFreelancer);
module.exports = router;
