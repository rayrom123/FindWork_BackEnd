const AuthenticateRouter = require("./AuthenticateRouter");

const routes = (app) => {
  app.use("/api/auth", AuthenticateRouter);
};

module.exports = routes;
