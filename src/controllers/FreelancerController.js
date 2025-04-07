const AuthenticateServices = require("../services/AuthenticateServices.js");

const createFreelancer = async (req, res) => {
  console.log("body req", req.body);
  try {
    const {
      username,
      password,
      fname,
      birthday,
      image,
      project_done,
      phone,
      experience,
      email,
      role,
    } = req.body;

    if (!role || role !== "freelancer") {
      console.log("Invalid user type. Must be 'freelancer'");
      return res.status(400).json({
        status: "Error",
        message: "Invalid user type. Must be 'freelancer'.",
      });
    }
    //Register as Freelancer
    if (role === "freelancer") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isCheckMail = emailRegex.test(email);
      if (!username || !password || !email) {
        return res.status(400).json({
          status: "Error",
          message: "The input is required",
        });
      }

      const response = await AuthenticateServices.RegisterFreelancer(req.body);
      return res.status(200).json(response);
    }
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

    const response_msg = await AuthenticateServices.checkLogin(
      username,
      password,
    );

    console.log("sucess");
    return res.status(200).json({
      status: "Success",
      response: respones_msg,
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
  createFreelancer,
  login,
};
