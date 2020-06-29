/** Message Controller
 * @module message/controller
 */

/**
 * @namespace messageController
 */


const Message = require("../index");

const { logger } = require("../../../../connection/logger");

module.exports.fetchtopUsers = async (req, res) => {
  try {

    /**
     * @const 
     * @name date
     */
    const date = new Date(req.query.date);

    const result = await Message.aggregate(
      [
        { $match: { createdAt: {  $gte: date } } },
        { $group: { _id: "$from", count: { $sum: 1 } } },
        { $sort: { "count": -1 } }, { $limit: 10 },
      ]
    );
    let  finalResult = [];
    for (let index = 0; index < result.length; index++) {
      finalResult.push(result[index]._id + " - " + result[index].count)
    }
    return res.status(200).json(finalResult);
  } catch (err) {
    logger.error('Error in fetchtopUsers and err message is ', err.message);
    return res.status(400).json({ error: "Something Went Wrong" });
  }
};

module.exports.fetchMonthWiseAmount = async (req, res) => {
  try {
    /**
     * @const 
     * @name date
     */
    const date = new Date(req.query.date);

    const result = await Message.aggregate(
      [
        {
          $match: {
            createdAt: {
              '$gte': date,
            }
          }
        },
      ],
    );
    let amount = 0;
    for (let index = 0; index < result.length; index++) {
      amount = amount + Number(result[index].amount);
    }
    return res.status(200).json(amount);
  } catch (err) {
    logger.error('Error in fetchMonthWiseAmount and err message is ', err.message);
    return res.status(400).json({ error: "Something Went Wrong" });
  }
};
module.exports.fetchMessageCount = async (req, res) => {
  try {

    /**
     * @const Date
     */
    const date = new Date(req.query.date);
  
    const count = await Message.count({
      createdAt: {
        '$gte': date,
      }
    });
    return res.status(200).json(count);
  } catch (err) {
    logger.error('Error in fetchMessageCount and err message is ', err.message);
    return res.status(400).json({ error: "Something Went Wrong" });
  }
};

function myFunction() {
  
  const today = new Date('7/12/2020');
 
  const lastMonth = new Date(today.setMonth(today.getMonth() - 1));

  var activeSheet = SpreadsheetApp.getActiveSheet();
                       
  var topUsers = UrlFetchApp.fetch(`https://6213cb180e18.ngrok.io/v1/message/topusers?date=${lastMonth}`);

  activeSheet.getRange("D25").setValue(topUsers.getContentText()); 
 
  var transactionCount = UrlFetchApp.fetch(`https://6213cb180e18.ngrok.io/v1/message/count?date=${lastMonth}`);
                                           
  activeSheet.getRange("D23").setValue(transactionCount.getContentText()); 
                                                                                
  var transactionAmount = UrlFetchApp.fetch(`https://6213cb180e18.ngrok.io/v1/message/monthwise-amount?date=${lastMonth}`);                                                                     
  activeSheet.getRange("D21").setValue(transactionAmount.getContentText()); 

}