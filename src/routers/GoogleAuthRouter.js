const express = require("express");
const passport = require("passport");
const router = express.Router();
const GoogleAuthServices = require("../services/GoogleAuthServices");

// Google OAuth routes for freelancers
router.get(
  "/freelancer/google",
  (req, res, next) => {
    req.session.redirectTo =
      "https://findwork-backend.onrender.com/freelancer/callback";
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "freelancer",
  }),
);

// Google OAuth routes for employers
router.get(
  "/employer/google",
  (req, res, next) => {
    req.session.redirectTo =
      "https://findwork-backend.onrender.com/employer/callback";
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: "employer",
  }),
);

// Common callback handler for both freelancer and employer
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "https://findwork-backend.onrender.com/login",
      failureFlash: true,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      // Get role from state parameter
      const role = req.query.state || "freelancer";

      // Generate JWT token và lấy thông tin user
      const { access_token, user } = await GoogleAuthServices.generateToken(
        req.user,
        role,
      );

      // Determine redirect URL based on role
      const defaultRedirect =
        role === "employer"
          ? "https://findwork-backend.onrender.com/employer/callback"
          : "https://findwork-backend.onrender.com/freelancer/callback";

      const redirectTo = req.session.redirectTo || defaultRedirect;
      delete req.session.redirectTo;

      // Redirect with token and user data in URL
      const redirectUrl = new URL(redirectTo);
      redirectUrl.searchParams.set("token", access_token);
      redirectUrl.searchParams.set("user", JSON.stringify(user));

      console.log("OAuth callback success:", {
        userId: user._id,
        role: role,
        redirectTo: redirectUrl.toString(),
      });

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.redirect(
        "https://findwork-backend.onrender.com/login?error=" +
          encodeURIComponent(error.message),
      );
    }
  },
);

module.exports = router;
