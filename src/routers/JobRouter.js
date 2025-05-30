const express = require("express");
const router = express.Router();
const JobController = require("../controllers/JobController");
const { auth, authRole } = require("../middleware/auth");
const JobService = require("../services/JobService");

// Job posting routes
// Tạo một job posting mới (chỉ dành cho employer)
router.post("/jobpost", auth, authRole("employer"), JobController.createJob);

// Lấy danh sách tất cả các job
router.get("/jobs", auth, authRole("freelancer"), JobController.getJobs);

// Lấy danh sách các job của một employer cụ thể
router.get(
  "/jobs/employerjob",
  auth,
  authRole("employer"),
  JobController.getJobsByEmployer,
);

// Lấy danh sách các job mà freelancer đã apply
router.get(
  "/freelancer/applied",
  auth,
  authRole("freelancer"),
  JobController.getAppliedJobs,
);

// Lấy thông tin chi tiết của một job theo ID
router.get("/jobs/:id", JobController.getJobById);

// Lấy danh sách các freelancer đang chờ employer xác nhận
router.get(
  "/jobs/:id/proposal",
  auth,
  authRole("employer"),
  JobController.getProposal,
);

// Cập nhật thông tin của một job (chỉ dành cho employer)

router.put("/jobs/:id", auth, authRole("employer"), JobController.updateJob);

// Xóa một job (chỉ dành cho employer)
router.delete("/jobs/:id", auth, authRole("employer"), JobController.deleteJob);

// Job application routes
// Apply vào một job (chỉ dành cho freelancer)
router.post(
  "/jobs/:id/apply",
  auth,
  authRole("freelancer"),
  JobController.applyJob,
);

// Reject một proposal (chỉ dành cho employer)
router.put(
  "/jobs/proposals/:applicationId/reject",
  auth,
  authRole("employer"),
  JobController.rejectProposal,
);
// Accept một proposal (chỉ dành cho employer)
router.put(
  "/jobs/proposals/:applicationId/accept",
  auth,
  authRole("employer"),
  JobController.acceptProposal,
);

// Tạo order thanh toán
router.post(
  "/jobs/:jobId/create-order",
  auth,
  authRole("employer"),
  JobController.createOrder,
);

// Xác nhận thanh toán
router.post(
  "/jobs/:jobId/capture",
  auth,
  authRole("employer"),
  JobController.captureOrder,
);

module.exports = router;
