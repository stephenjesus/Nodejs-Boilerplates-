/**
 * @module message/service
 */

/**
 * @namespace messageService
 */

const _ = require("lodash");
const Message = require("../index");

/**
 * Module to prepare ledger of  a user.
 * @name prepareLedger
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @param {String} userPhone - Phone number of the user whose ledger needs to be created.
 * @returns {Object} Returns an object containing user ledger.
 */
module.exports.prepareLedger = async userPhone => {
  // Get all the transactions of which user is a part of
  const ledger = await Room.find({ members: { $elemMatch: { contact: userPhone } } })
    .populate("messages");

  /**
   * Calculate and return total amount received, owed and group
   * them on the basis of type either LEDGER and GROUP.
   */
  return await this.getLedgerWithOwes(ledger, userPhone);
};

/**
 * Module to get empty ledger object
 * @name getEmptyLedger
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @returns {Object} Empty ledger.
 */
module.exports.getEmptyLedger = () => {
  return {
    ledger: [],
    groups: [],
    totalAmountGiven: "0.00",
    totalAmountReceived: "0.00",
    netAmount: "0.00",
    journal: []
  };
};

/**
 * Module to group ledger and calculate net amount of ledger.
 * @name getLedgerWithOwes
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @param {String} ledger - Ungrouped ledger which needs to be grouped.
 * @param {String} userPhone - Phone number of the user whose ledger needs to be created.
 * @returns {Object} Returns an object containing user ledger.
 */
module.exports.getLedgerWithOwes = (ledger, userPhone) => {
  // returning a promise
  return new Promise((resolve, reject) => {
    // Array in which ledger of each room will be pushed.
    let newLedger = [];

    // Initializing the total amount given of the ledger to 0.
    let totalAmountGiven = 0;

    // Initializing the total amount received of the ledger to 0.
    let totalAmountReceived = 0;

    // Array in which messages of each room will be pushed.
    let journal = [];

    // calulating the length of ungrouped ledger.
    const ledgerLength = ledger.length;

    /**
     * If no room is present or lenght of the ledger is 0 then resolve
     * with empty ledger.
     */
    if (ledgerLength === 0) { resolve(this.getEmptyLedger()); }

    // iterating through each room and calculating owes and net amount.
    ledger.map(async element => {
      // initalizing unsettledAmount with 0 per room.
      let unsettledAmount = 0;

      // declaring settleStatus which can be one of TO_GIVE, TO_RECEIVE, SETTLED
      let settleStatus;

      /**
       * - members   : List of members participating in the room.
       *    - name    : Name of the member
       *    - contact : Phone number of the memeber
       *    - admin   : If the member has admin rights
       * - messages  : List of transaction messages.
       * - roomType  : Type of room whether LEDGER or GROUP
       * - roomName  : Display name of the room.
       * - createdAt : Timestamp of when the room was created.
       */
      let { members, messages, _id, roomType, roomName, createdAt } = element;

      journal = [...journal, ...messages];

      if (roomType === "LEDGER") {
        let roomMember = members.filter(member => member.contact !== userPhone);
        if (roomMember.length > 0) {
          roomName = roomMember[0].name;
        }
      }

      // total amount given per room.
      let totalGiven = 0;

      // total amount accepted per room
      let totalAccepted = 0;

      // iterating through each transaction message.
      messages.map((entry, index) => {
        /**
         * - from            : Phone number of the one who initiated the transaction.
         * - transactionType : Type of transaction either ACCEPT or GIVE
         * - amount          : Amount accepted or given.
         */
        let { from, transactionType, amount } = entry;

        // converting string amount to float
        amount = parseFloat(amount);

        /**
         * If the user whose ledger is being created has accepted a certain amount then the
         * total accepted of this room will be incremented alongside with the unsettled amount
         * as he is accepting a certain amount from someone. Also if the transaction is deleted
         * or the transaction belongs to the GROUP then ignore those as the group transactions
         * are settled in LEDGER, so total amount received does not contain the same amount twice.
         */
        if (userPhone === from && transactionType === "ACCEPT" && !entry.deleted) {
          unsettledAmount = unsettledAmount + amount;
          if (roomType !== "GROUP") {
            totalAmountReceived = totalAmountReceived + amount;
          }
          totalAccepted = totalAccepted + amount;
        }

        /**
         * If the user whose ledger is being created has given a certain amount then the total given
         * of this room will be incremented alongside with the decrease in unsettled amount as he is
         * giving a certain amount from someone means he is settling some amount. Also if the transaction
         * is deleted or the transaction belongs to the GROUP then ignore those as the group transactions
         * are settled in LEDGER, so total amount given does not contain the same amount twice.
         */
        if (userPhone === from && transactionType === "GIVE" && !entry.deleted) {
          unsettledAmount = unsettledAmount - amount;
          if (roomType !== "GROUP") {
            totalAmountGiven = totalAmountGiven + amount;
          }
          totalGiven = totalGiven + amount;
        }

        /**
         * If the transaction is not initiated by the user who is requesting the ledger and the transaction
         * type is ACCEPT means the user requesting the ledger has given that amount so the total given
         * of this room will be incremented alongside with the decrease in unsettled amount as he is
         * giving a certain amount from someone means he is settling some amount. Also if the transaction
         * is deleted or the transaction belongs to the GROUP then ignore those as the group transactions
         * are settled in LEDGER, so total amount given does not contain the same amount twice.
         */
        if (userPhone !== from && transactionType === "ACCEPT" && !entry.deleted) {
          unsettledAmount = unsettledAmount - amount;
          if (roomType !== "GROUP") {
            totalAmountGiven = totalAmountGiven + amount;
          }
          totalGiven = totalGiven + amount;
        }

        /**
         * If the transaction is not initiated by the user who is requesting the ledger and the transaction
         * type is GIVE means the user requesting the ledger has accepted that amount so the total accepted
         * of this room will be incremented alongside with the increase in unsettled amount as he is accepting
         * a certain amount from someone. Also if the transaction is deleted or the transaction belongs to the
         * GROUP then ignore those as the group transactions are settled in LEDGER, so total amount received
         * does not contain the same amount twice.
         */
        if (userPhone !== from && transactionType === "GIVE" && !entry.deleted) {
          unsettledAmount = unsettledAmount + amount;
          if (roomType !== "GROUP") {
            totalAmountReceived = totalAmountReceived + amount;
          }
          totalAccepted = totalAccepted + amount;
        }
      });

      if (unsettledAmount > 0) {
        /**
         * if the unsettled amount is positive, then it means the user requesting the ledger has to give the
         * unsettled amount to the other members of that room, so settle status should be TO_GIVE
         */
        settleStatus = "TO_GIVE";
      } else if (unsettledAmount < 0) {
        /**
         * if the unsettled amount is negative, then it means the user requesting the ledger will receive the
         * unsettled amount from the other members of that room, so settle status should be TO_RECEIVE
         */
        settleStatus = "TO_RECEIVE";
      } else {
        /**
         * if there is no amount to settle then set the settle status to SETTLED
         */
        settleStatus = "SETTLED";
      }

      // creating an owes object containing unsettles amount and status if settlement
      const owes = {
        unsettledAmount: Math.abs(unsettledAmount).toFixed(2),
        settleStatus
      };

      // creating an room details object containing room information
      const roomDetails = {
        members,
        roomType,
        roomName
      };

      // Pushing the above values to the ledger.
      newLedger.push({
        createdAt,
        owes,
        totalGiven: totalGiven.toFixed(2).toString(),
        totalAccepted: totalAccepted.toFixed(2).toString(),
        entry: messages,
        _id,
        roomDetails
      });

      /**
       * if all the rooms has been iterated then resolved the promise and return the ledger
       */
      if (newLedger.length === ledgerLength) {
        // calculating net amount from total amount received and total amount given
        let netAmount = totalAmountReceived - totalAmountGiven;
        resolve({
          ledger: this.groupLedger(newLedger),
          ungroupedLedger: newLedger,
          journal,
          totalAmountGiven: Math.abs(totalAmountGiven).toFixed(2).toString(),
          totalAmountReceived: Math.abs(totalAmountReceived).toFixed(2).toString(),
          netAmount: netAmount.toFixed(2).toString()
        });
      }
    });
  });
};

/**
 * Module to group ledger base on room type i.e. LEDGER and GROUP
 * @name groupLedger
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @param {String} ledger - Ungrouped ledger which needs to be grouped.
 * @returns {Object} Returns an object containing user ledger.
 */
module.exports.groupLedger = ledger => {
  // grouping ledger on the basis room type.
  return _.chain(ledger).groupBy("roomDetails.roomType");
};

/**
 * Module to calculate top n amount owes and owed.
 * @name groupLedger
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @param {String} ledger - Ungrouped ledger
 * @param {Number} n - No of items to be returned after sorting.
 * @returns {Object} Returns an object containing user ledger.
 */
module.exports.prepareTopNLedger = (ledger, n = 5) => {
  /**
   * Top N needs to be caluclated for each settle status i.e. TO_RECEIVE,
   * TO_GIVE and SETTLED. So here first grouping the ledger based on the
   * settlement status.
   */
  let newLedger = _.chain(ledger).groupBy("owes.settleStatus").value();

  // For each settle status calculate top N owes and owed.
  Object.keys(newLedger).map(key => {
    let value = newLedger[key.toString()];
    value = _.sortBy(value, obj => parseInt(obj.owes.unsettledAmount, 10));
    newLedger[key.toString()] = _.takeRight(value, n).reverse();
  });

  return newLedger;
};

/**
 * Module to check if a room exists between two numbers.
 * @name findRoom
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @param {String} from - First Phone Number
 * @param {String} to - Second Phone Number
 * @returns {Object} Returns an object containing room details and roon status
 */
module.exports.findRoom = async (from, to) => {
  // calculating the room hash from the two phone numbers.
  const roomHash = roomService.generateGroupHash(from, to);

  // Checking db for room with the same hash
  let room = await Room.findOne({ roomHash });

  // If room exists send the room details and status as true
  if (room) {
    return { status: true, room: room._doc };
  }

  // If room doesn't exists send the room status as false
  return { status: false };
};

/**
 * Module to save the split messages from the group.
 * @name findRoomAndSaveMessage
 * @function
 * @memberof module:message/service~messageService
 * @inner
 * @param {Array} messages - List of messages generated after group split
 * @returns {Promise} Returns an promise.
 */
module.exports.findRoomAndSaveMessage = messages => {
  let filteredMessages = messages.filter(message => message.from !== message.to);

  // returning a promise
  return new Promise((resolve, reject) => {
    /**
     * For each split check if the room is avilable between the user and his contact then
     * update the room with new message and if the room is not available then create a new
     * room and add the transaction message in that room.
     */
    filteredMessages.map(async (messagePayload, index) => {
      /**
       * - from         : Phone number of the one who initiated the transaction.
       * - to           : Phone number of the contact
       * - senderName   : Name of the one who initiated the transaction.
       * - receiverName : Name of the contact
       */
      const { from, to, senderName, receiverName } = messagePayload;

      // status of whether room exists between those numbers or not.
      const roomStatus = await this.findRoom(from, to);
      let roomId = "";

      // if room exists then update the roomId variable with the id of the same room
      if (roomStatus.status) {
        roomId = roomStatus.room._id;
      } else {
        const { from: fromPhone } = messagePayload;

        // generate payload similar to the room schema for room generation.
        const roomPayload = roomService.generateRoomPayload(fromPhone, to, senderName, receiverName);

        // creare a room with the same payload created above.
        const room = await roomService.createRoom(roomPayload);

        // extracting room id from that room and assing roomId variable
        const { _id } = room;
        roomId = _id;
      }

      // attaching the room id to the message
      const messageData = { ...messagePayload, roomId };

      // persiste the transaction message to db
      const transaction = await Message.create(messageData);

      // push the message id to the room.
      await Room.findOneAndUpdate({ _id: roomId }, { $push: { messages: transaction._id } }, { new: true });

      // if all messages are traversed the resolve.
      if (index === filteredMessages.length - 1) {
        resolve();
      }
    });
  });
};
