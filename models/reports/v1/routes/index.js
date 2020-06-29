
const router = require("express").Router();

const controllerMethods = require("../controller");

router.get("/message/topusers", controllerMethods.fetchtopUsers);

router.get("/message/count", controllerMethods.fetchMessageCount);

router.get("/message/monthwise-amount", controllerMethods.fetchMonthWiseAmount);



module.exports = router;
