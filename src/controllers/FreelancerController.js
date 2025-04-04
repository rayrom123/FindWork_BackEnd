const FreelancerServices = require("../services/FreelancerServices");

const ApplyJob = async (req, res) => {
  console.log("body req", req.body);

  try {
    const { jobId, freelancerId } = req.body;

    if (!freelancerId || !jobId) {
      return res.status(400).json({
        status: "Error",
        message: "The input is required",
      });
    }

    console.log("inputf");
    const response = await FreelancerServices.ApplyJob(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log("fail2");
    return res.status(400).json({
      message: "fail",
    });
  }
};

module.exports = {
  ApplyJob,
};
