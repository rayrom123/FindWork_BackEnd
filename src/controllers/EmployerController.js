const EmployerServices = require("../services/EmployerServices");

const PostJob = async (req, res) => {
  console.log("body req", req.body);
  try {
    const { title, description, location, salary, employerId } = req.body;

    console.log("post");

    if (!title || !description || !employerId) {
      return res.status(400).json({
        status: "Error",
        message: "The input is required",
      });
    }

    const response = await EmployerServices.PostJob(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log("fail2");
    return res.status(400).json({
      message: "fail",
    });
  }
};

module.exports = {
  PostJob,
};
