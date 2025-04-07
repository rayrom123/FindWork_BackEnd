const EmployerRouter = require("./EmployerRouter");
const FreelancerRouter = require("./FreelancerRouter");

const routes = (app) => {
  app.use("/api", EmployerRouter);
  app.use("/api", FreelancerRouter);
  //Test API use Path localhost::<port>/api/<role>/<function>
};

module.exports = routes;
