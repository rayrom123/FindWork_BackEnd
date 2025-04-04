const AuthenticateRouter = require("./AuthenticateRouter");
const FreelancerRouter = require("./FreelancerRouter");
const EmployerRouter = require("./EmployerRouter");
const FacebookAuthRouter = require("./FacebookAuthRouter");
const routes = (app) => {
  app.use("/api/auth", AuthenticateRouter);
  app.use("/api/employer", EmployerRouter);
  app.use("/api/freelancer", FreelancerRouter);
  
  app.use("/", FacebookAuthRouter);
};

module.exports = routes;
