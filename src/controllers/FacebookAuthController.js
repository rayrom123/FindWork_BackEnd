// controllers/auth.controller.js
const authService = require("../services/FacebookAuthServices");

const facebookLogin = (req, res, next) => {
  authService.facebookLogin(req, res, next);
};

const facebookCallback = (req, res, next) => {
  authService.facebookCallback(req, res, next);
};

module.exports = {
  facebookLogin,
  facebookCallback,
};
