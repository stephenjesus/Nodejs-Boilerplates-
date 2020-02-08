const mongoose = require("mongoose");

var log = require('log4js').getLogger("mongoose");
/**
 * Loading environment variables
 */
require("dotenv").config();

/**
 * Opening Mongoose Connection
 */
mongoose.connect(process.env.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/**
 * Connected Handler
 */
mongoose.connection.on("connected", () => {
  log.info("MongoDB connected Successfully!!");
});

/**
 * Mongoose Error Handler
 */
mongoose.connection.on("error", err => {
  log.error(`Error in mongoose connection: ${err.message}`);
});

/**
 * Mongoose Disconnected Handler
 */
mongoose.connection.on("disconnected", () => {
  log.info("Mongoose connection is disconnected");
});

/**
 * Unexpected Shutdown Handler
 */
process.on("SIGINT", function() {
  mongoose.connection.close(() => {
    process.exit(0);
  });
});
