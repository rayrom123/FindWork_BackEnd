const EmployerRouter = require("./EmployerRouter");
const FreelancerRouter = require("./FreelancerRouter");
const JobRouter = require("./JobRouter");

const routes = (app) => {
  app.use("/api", EmployerRouter);
  app.use("/api", FreelancerRouter);
  app.use("/api", JobRouter);
  //Test API use Path localhost::<port>/api/<role>/<function>
};

module.exports = routes;
