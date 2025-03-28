const AuthenticateServices = require("../services/AuthenticateServices.js");

const register = async (req, res) => {
  console.log("body req", req.body);
  try {
    const {
      role,
      username,
      password,
      fname,
      birthday,
      image,
      project_done,
      phone,
      experience,
      email,
      companyName,
      companyLogo,
      contactEmail,
      phoneNumber,
      companyDescription,
      location,
    } = req.body;

    if (!role || !["employer", "freelancer"].includes(role)) {
      console.log("Invalid user type. Must be 'employer' or 'freelancer");
      return res.status(400).json({
        status: "Error",
        message: "Invalid user type. Must be 'employer' or 'freelancer'.",
      });
    }
    //Register as Freelancer
    if (role === "freelancer") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isCheckMail = emailRegex.test(email);
      console.log("isCheckEmail", isCheckMail);
      if (!username || !password || !email) {
        return res.status(400).json({
          status: "Error",
          message: "The input is required",
        });
      }

      const response = await AuthenticateServices.RegisterFreelancer(req.body);
      return res.status(200).json(response);
    }
    //
    //Register as Employer
    else if (role === "employer") {
      console.log("em");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isCheckMail = emailRegex.test(contactEmail);
      if (
        !companyName ||
        !companyLogo ||
        !contactEmail ||
        !phoneNumber ||
        !companyDescription ||
        !location
      ) {
        return res.status(400).json({
          status: "Error",
          message: "The input is required",
        });
      }
      console.log("isCheckEmail", isCheckMail);
      const response = await AuthenticateServices.RegisterEmployer(req.body);
      return res.status(200).json(response);
    }
    //
  } catch (e) {
    return res.status(404).json({
      message: "Username or email address already exists.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !password) {
      return res.status(400).json({
        status: "Error q",
        message: "Username and password are required",
      });
    }

    const userInfo = await AuthenticateServices.checkLogin(username, password);

    console.log("sucess");
    return res.status(200).json({
      status: "Success",
      user: userInfo,
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(401).json({
      status: "Error",
      message: e.message,
    });
  }
};
module.exports = {
  register,
  login,
};
