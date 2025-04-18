const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");
const { auth, authRole } = require("../middleware/auth");

// Job posting routes
router.post("/jobpost", auth, authRole("employer"), JobController.createJob);
router.get("/jobs", JobController.getJobs);
router.get("/jobs/:id", JobController.getJobById);
router.put("/jobs/:id", auth, authRole("employer"), JobController.updateJob);
router.delete("/jobs/:id", auth, authRole("employer"), JobController.deleteJob);

// Job application routes
router.post(
  "/jobs/:id/apply",
  auth,
  authRole("freelancer"),
  JobController.applyJob,
);
router.get(
  "/jobs/applied",
  auth,
  authRole("freelancer"),
  JobController.getAppliedJobs,
);

module.exports = router;
