/** Message Schema
 * @module message/schema
 */

/**
 * Mongoose driver for MongoDb
 * @const
 */
const mongoose = require("mongoose");

const moment = require("moment");

/**
 * Mongoose Schema
 * @const
 */
const MessageSchema = new mongoose.Schema({
  amount: {
    type: String
  },

  currency: {
    type: String,
    default: "INR"
  },

  note: {
    type: String
  },

  date: {
    type: String,
    default: function () {
      return moment().toISOString();
    }
  },

  senderName: {
    type: String
  },

  receiverName: {
    type: String
  },

  audioFile: {
    type: String
  },

  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestRoom"
  },

  from: {
    type: String
  },

  to: {
    type: String
  },

  images: {
    type: Array,
    default: []
  },

  deleted: {
    type: Boolean,
    default: false
  },

  transactionType: {
    type: String
  },

  category: {
    type: String
  },

  memberSplit: {
    type: Array,
    default: []
  },

  paymentMode: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("TestMessage", MessageSchema);
