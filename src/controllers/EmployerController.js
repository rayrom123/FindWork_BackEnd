const EmployerService = require("../services/FreelancerServices");
const createUser = async (req, res) => {
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
    } = req.body;
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
      return res.status(200).json({
        status: "Error",
        message: "The input is required",
      });
    }
    const response = await EmployerService.createEmployer(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};
module.exports = {
  createUser,
};
