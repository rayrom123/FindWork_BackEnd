const express = require("express");
const router = express.Router();
const AuthenController = require("../controllers/AuthenticateController");

router.post("/register", AuthenController.register),
  router.post("/login", AuthenController.login);

module.exports = router;
