const AuthenticateServices = require("../services/AuthenticateServices");

const RegisterEmployer = async (req, res) => {
  console.log("body req", req.body);
  try {
    const {
      companyName,
      companyPassword,
      companyLogo,
      contactEmail,
      phoneNumber,
      companyDescription,
      location,
    } = req.body;

    
    if (
      !companyName ||
      !companyPassword ||
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isCheckMail = emailRegex.test(contactEmail);
    
    if(!isCheckMail)
    {
      console.log("isCheckEmail", isCheckMail);
      return res.status(404).json({
        message: "invalid email",
    })
    }
    
    const response = await AuthenticateServices.RegisterEmployer(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log("fail2");
    return res.status(404).json({
      message: "fail",
    });
  }
};

const RegisterFreelancer = async (req, res) => {
  console.log("body req", req.body);
  try {
    const {
      username,
      password,
      fname,
      birthday,
      image,
      phone,
      experience,
      email,
    } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isCheckMail = emailRegex.test(email);
    console.log("isCheckEmail", isCheckMail);
    if (
      !username ||
      !password ||
      !fname ||
      !image ||
      !phone ||
      !experience ||
      !email
    ) {
      return res.status(400).json({
        status: "Error",
        message: "The input is required",
      });
    }

    const response = await AuthenticateServices.RegisterFreelancer(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log("fail2");
    return res.status(404).json({
      message: "fail",
    });
  }
};

const LoginEmployer = async (req, res) => {
    try {
      const {email, password } = req.body;
  
      // Kiểm tra các trường bắt buộc
      if (!email || !password) {
        return res.status(400).json({
          status: "Error q",
          message: "Username and password are required",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isCheckMail = emailRegex.test(email);
      
      if(isCheckMail === false)
      {
        console.log("isCheckEmail", isCheckMail);
        return res.status(404).json({
          message: "invalid email",
      })
      }
  
      const userInfo = await AuthenticateServices.LoginEmployer(email, password);
  
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

const LoginFreelancer = async (req, res) => {
  try {
    const {email, password } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res.status(400).json({
        status: "Error q",
        message: "email and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isCheckMail = emailRegex.test(email);
    
    if(!isCheckMail)
    {
      console.log("isCheckEmail", isCheckMail);
      return res.status(404).json({
        message: "invalid email",
    })
    }

    const userInfo = await AuthenticateServices.LoginFreelancer(email, password);

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
  RegisterEmployer,
  RegisterFreelancer,
  LoginEmployer,
  LoginFreelancer
};
