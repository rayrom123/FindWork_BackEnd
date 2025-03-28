// services/auth.service.js
const passport = require("passport");
const freelancer = require("../models/Freelancer"); // Giả sử bạn có model User

const facebookLogin = passport.authenticate("facebook", { scope: ["email"] });

const facebookCallback = passport.authenticate("facebook", {
  failureRedirect: "/login",
});
async (req, res) => {
  res.redirect("/dashboard");
};

async function findOrCreateUser(profile) {
  try {
    let user = await freelancer.findOne({ facebookId: profile.id });

    if (user) {
      return user;
    }

    const newFreelancer = new freelancer({
      facebookId: profile.id,
      name: profile.displayName,
      email: profile.emails ? profile.emails[0].value : null,
      // Thêm các trường thông tin khác bạn muốn lưu trữ
    });

    await newFreelancer.save();
    return newFreelancer;
  } catch (error) {
    console.error("Lỗi khi tìm hoặc tạo người dùng:", error);
    throw error;
  }
}

module.exports = {
  facebookLogin,
  facebookCallback,
  findOrCreateUser,
};
