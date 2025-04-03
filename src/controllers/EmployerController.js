const AuthenticateServices = require("../services/AuthenticateServices");

const createEmployer = async (req, res) => {
  console.log("body req", req.body);
  try {
    console.log(req.body);
    const {
      companyName,
      companyLogo,
      contactEmail,
      phoneNumber,
      companyDescription,
      location,
      role,
      password,
    } = req.body;
    if (!role || role !== "employer") {
      console.log("Invalid role");
      return res.status(400).json({
        status: "Error",
        message: "Invalid user role.",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isCheckMail = emailRegex.test(contactEmail);
    if (!companyName || !contactEmail || !password) {
      return res.status(200).json({
        status: "Error",
        message: "The input is required",
      });
    }

    const response = await AuthenticateServices.RegisterEmployer(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
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
  createEmployer,
  login,
};
