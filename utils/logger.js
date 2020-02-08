const log4js = require('log4js');
log4js.configure({
    appenders: {
        console: { type: 'console' },
        // logstash: { 
        //     type: '@log4js-node/logstash-http', 
        //     url: 'https://search-afrassearch-3dmfsu4cvx55mc7kffdqpqzddu.us-east-2.es.amazonaws.com/_bulk', 
        //     application: 'loan-data', 
        //     logType: 'application', 
        // },
         loggers: { type: 'file', filename: 'loggers.log' } 
        },
        categories: { default: { appenders: ['loggers' , 'console'], level: 'info' } }
        // categories: { default: { appenders: ['loggers', 'logstash' , 'console'], level: 'info' } }
});
const logger = log4js.getLogger();
module.exports = {logger};