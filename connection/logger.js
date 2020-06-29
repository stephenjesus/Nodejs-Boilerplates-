const log4js = require("log4js");

log4js.configure({
  appenders: {

    logstash: {
      type: "@log4js-node/logstash-http",
      url: process.env.ELASTIC_LOGSTASH_URL,
      application: "ledger-dev",
      logType: "application"
    },

    console: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} %p %c %m - %f{1}:%l"
      }
    },

    file: {
      type: "file",
      filename: "ledger-dev.log",
      layout: {
        type: "pattern",
        pattern: "%d{yyyy-MM-dd hh:mm:ss.SSS} %p %c %m - %f{1}:%l"
      },
      maxLogSize: 10485760,
      compress: true,
      keepFileExt: true
    }
  },
  categories: {
    default: { appenders: ["file", "logstash"], level: "debug", enableCallStack: true },
    console: { appenders: ["console"], level: "info" }
  }

});

const logger = log4js.getLogger();
const consoleLogger = log4js.getLogger("console");

module.exports = { logger, consoleLogger };
