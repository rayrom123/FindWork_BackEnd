// Simple Facebook authentication service
// This is a placeholder implementation

const Employer = require("../models/Employer");
const Freelancer = require("../models/Freelancer");
const passport = require("passport");

const findOrCreateUser = async (profile, role = "freelancer") => {
  try {
    const Model = role === "employer" ? Employer : Freelancer;

    // Tìm user theo Facebook ID
    let user = await Model.findOne({ facebookId: profile.id });

    if (!user) {
      // Nếu không tìm thấy user, tạo user mới
      user = new Model({
        facebookId: profile.id,
        username: profile.displayName,
        email: profile.emails ? profile.emails[0].value : null,
        avatar: profile.photos ? profile.photos[0].value : null,
        provider: "facebook",
      });

      await user.save();
    }

    return user;
  } catch (error) {
    console.error("Error in findOrCreateUser:", error);
    throw error;
  }
};

const findUserById = async (id, role = "freelancer") => {
  try {
    const Model = role === "employer" ? Employer : Freelancer;
    return await Model.findById(id);
  } catch (error) {
    console.error("Error in findUserById:", error);
    throw error;
  }
};

const handleFacebookCallback = async (req, res, next) => {
  const role = req.baseUrl.includes("employer") ? "employer" : "freelancer";
  passport.authenticate("facebook", {
    successRedirect: `http://localhost:3001/${role}/dashboard`,
    failureRedirect: `http://localhost:3001/${role}/login`,
  })(req, res, next);
};

const checkAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user,
    });
  } else {
    res.json({ isAuthenticated: false });
  }
};

const handleLogout = (req, res) => {
  const role = req.baseUrl.includes("employer") ? "employer" : "freelancer";
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.redirect(`http://localhost:3001/${role}/login`);
  });
};

module.exports = {
  findOrCreateUser,
  findUserById,
  handleFacebookCallback,
  checkAuthStatus,
  handleLogout,
};
