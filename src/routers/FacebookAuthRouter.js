const express = require("express");
const passport = require("passport");
const router = express.Router();
const FacebookAuthServices = require("../services/FacebookAuthServices"); // Đảm bảo đường dẫn đúng

// Facebook OAuth route cho freelancer
router.get(
  "/freelancer/facebook",
  (req, res, next) => {
    req.session.redirectTo = "http://localhost:5173/freelancer/callback"; // Điều chỉnh nếu cần
    next();
  },
  passport.authenticate("facebook", {
    scope: ["public_profile"],
    state: "freelancer",
  }),
);

// Callback handler cho Facebook
router.get(
  "/facebook/callback",
  (req, res, next) => {
    passport.authenticate("facebook", {
      // Sử dụng 'facebook'
      failureRedirect: "http://localhost:5173/login", // Điều chỉnh
      failureFlash: true,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      // Generate JWT token và lấy thông tin user
      const { access_token, user } = await FacebookAuthServices.generateToken(
        req.user,
      ); // Không cần role ở đây

      const redirectTo =
        req.session.redirectTo || "http://localhost:5173/freelancer/callback";
      delete req.session.redirectTo;

      // Redirect với token và user data trong URL
      const redirectUrl = new URL(redirectTo);
      redirectUrl.searchParams.set("token", access_token);
      redirectUrl.searchParams.set("user", JSON.stringify(user));

      console.log("Facebook OAuth callback success:", {
        // Log phù hợp
        userId: user._id,
        redirectTo: redirectUrl.toString(),
      });

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error("Error in Facebook callback:", error);
      res.redirect(
        "http://localhost:5173/login?error=" +
          encodeURIComponent(error.message),
      );
    }
  },
);

module.exports = router;
