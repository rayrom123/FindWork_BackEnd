const passport = require("passport");
// const FacebookStrategy = require("passport-facebook").Strategy;
// const FacebookAuthServices = require("../services/FacebookAuthServices"); // Điều chỉnh đường dẫn nếu cần
require("dotenv").config({ path: "./src/config/.env" });
module.exports = function (app) {
  // Comment out Facebook authentication
  /*
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.Facebook_APP_ID,
        clientSecret: process.env.Facebook_SECRET_ID,
        callbackURL: "/auth/facebook/callback",
      },

      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await FacebookAuthServices.findOrCreateUser(profile);
          console.log("Connect to facebook app");
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );
  */
};
