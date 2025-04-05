const Job = require("../models/job");

const PostJob = (JobData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newJob = new Job(JobData);
      await newJob.save();

      const savedData = await newJob.save();
      console.log("Saved data:", savedData);

      console.log("sucess");

      resolve("Created:", newJob);
    } catch (e) {
      console.log("fail1");
      reject(e);
    }
  });
};

module.exports = {
  PostJob,
};
