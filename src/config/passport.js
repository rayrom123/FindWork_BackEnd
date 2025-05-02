const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookAuthServices = require("../services/FacebookAuthServices");
const GoogleAuthServices = require("../services/GoogleAuthServices");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/.env" });

const configurePassport = (app) => {
  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, {
      id: user.id,
      role: user.role || "freelancer",
      provider: user.provider,
    });
  });

  // Deserialize user
  passport.deserializeUser(async ({ id, role, provider }, done) => {
    try {
      let user;
      if (provider === "facebook") {
        user = await FacebookAuthServices.findUserById(
          id,
          role || "freelancer",
        );
      } else if (provider === "google") {
        user = await GoogleAuthServices.findUserById(id, role);
      }
      done(null, user);
    } catch (error) {
      console.error("Deserialize user error:", error);
      done(error, null);
    }
  });

  // Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "/auth/facebook/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("Facebook OAuth callback received:", {
            profileId: profile.id,
            email: profile._json.email,
            state: req.query.state,
          });

          // Get role from state parameter
          const role = req.query.state || "freelancer";

          if (!["employer", "freelancer"].includes(role)) {
            throw new Error("Invalid role specified in state parameter");
          }

          // Find or create user
          const user = await FacebookAuthServices.findOrCreateUser(
            profile,
            role,
          );

          // Thêm role vào user object
          user.role = role;

          return done(null, user);
        } catch (error) {
          console.error("Facebook OAuth error:", error);
          return done(error, false);
        }
      },
    ),
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google OAuth callback received:", {
            profileId: profile.id,
            email: profile.emails?.[0]?.value,
            state: req.query.state,
          });

          // Get role from state parameter
          const role = req.query.state || "freelancer";

          if (!["employer", "freelancer"].includes(role)) {
            throw new Error("Invalid role specified in state parameter");
          }

          // Find or create user
          const user = await GoogleAuthServices.findOrCreateUser(profile, role);

          return done(null, user);
        } catch (error) {
          console.error("Google OAuth error:", error);
          return done(error, false);
        }
      },
    ),
  );

  app.use(passport.initialize());
  app.use(passport.session());
};

module.exports = configurePassport;
