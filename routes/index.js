module.exports = app => {
  app.use("/v1", require("../models/reports/v1/routes"));
};
