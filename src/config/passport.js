const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const FacebookAuthServices = require("../services/FacebookAuthServices");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/.env" });

const configurePassport = (app) => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, role: user.provider });
  });

  // Deserialize user
  passport.deserializeUser(async ({ id, role }, done) => {
    try {
      const user = await FacebookAuthServices.findUserById(id, role);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback",
        profileFields: ["id", "displayName", "email", "photos"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Determine role based on the route being accessed
          const role = req.baseUrl.includes("employer")
            ? "employer"
            : "freelancer";
          const user = await FacebookAuthServices.findOrCreateUser(
            profile,
            role,
          );
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );

  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = configurePassport;
