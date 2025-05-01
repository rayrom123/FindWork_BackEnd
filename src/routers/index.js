// Import routers
const EmployerRouter = require("./EmployerRouter");
const FreelancerRouter = require("./FreelancerRouter");
const JobRouter = require("./JobRouter");
const ChatRouter = require("./ChatRouter");
const GoogleAuthRouter = require("./GoogleAuthRouter");

// Define routes
const routes = (app) => {
  app.use("/api/employer", EmployerRouter);
  app.use("/api/freelancer", FreelancerRouter);
  app.use("/api", JobRouter);
  app.use("/api/message", ChatRouter);
  app.use("/auth", GoogleAuthRouter);
};

// Export routes
module.exports = routes;
