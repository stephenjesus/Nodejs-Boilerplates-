/** Express Server
 * @module server/app
 */

/**
 * @namespace appServer
 */

/**
 * Express is a Node.js web application framework
 * @const
 */
const express = require("express");

/**
 * Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
 * @const
 */
const cookieParser = require("cookie-parser");

/**
 * Parse Request Body and populate req.body with it.
 * @const
 */
const bodyParser = require("body-parser");

/**
 * Initializing express application.
 * @const
 */
const app = express();

/**
 * CORS is a Node.JS package for providing a Connect/Express middleware that can be used to enable CORS
 * @const
 */
const cors = require("cors");

/**
 * Firebase utilities for initilizing and sending push notification
 */
// const firebaseutils = require("./utils/v1/firebaseutils");

/**
 * Initialize the firebase connection
 */
// firebaseutils.initializeFirebase();

/**
 * Importing mongoose connection
 */
require("./connection/mongoose");

/**
 * Initializing passport
 */
// require("./connection/passport");

/**
 * Setting the view engine of express application as pug so that it can
 * render the dynamic HTML view of the same.
 */
app.set("view engine", "pug");

/**
 * Cross Origin Resource Sharing (CORS) allows us to use Web applications within browsers when domains aren't the same
 * @function
 * @name use
 * @memberof module:server/app~appServer
 * @inner
 * @param {method} cors - Enable cors in our application
 */
app.use(cors());

/**
 * Recognize the incoming Request Object as strings or arrays.
 * @function
 * @name use
 * @memberof module:server/app~appServer
 * @inner
 * @param {method} urlencoded - Middleware
 */
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

/**
 * Recognize the incoming Request Object as a JSON Object.
 * @function
 * @name use
 * @memberof module:server/app~appServer
 * @inner
 * @param {method} json - Middleware
 */
app.use(bodyParser.json({ limit: "10mb", extended: true }));

/**
 * Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
 * @function
 * @name use
 * @memberof module:server/app~appServer
 * @inner
 * @param {method} cookieParser - Midddleware
 */
app.use(cookieParser());


require("./routes")(app);

module.exports = app;
