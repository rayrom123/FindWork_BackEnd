const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
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
      if (provider === "google") {
        user = await GoogleAuthServices.findUserById(id, role);
      } else {
        // Xử lý các provider khác nếu có, hoặc trả về lỗi nếu không tìm thấy
        return done(new Error("Unknown provider"), null);
      }
      done(null, user);
    } catch (error) {
      console.error("Deserialize user error:", error);
      done(error, null);
    }
  });

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
