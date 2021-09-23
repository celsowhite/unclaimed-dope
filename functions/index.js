const firebaseAdmin = require("firebase-admin");

/*---------------------
Init
---------------------*/
firebaseAdmin.initializeApp({});

/*---------------------
HTTP Triggers
---------------------*/
const test = require("./http/test");
exports.test = test;

/*---------------------
Pubsub Triggers
---------------------*/
const checkUnclaimedDope = require("./pubsub/checkUnclaimedDope");
exports.checkUnclaimedDope = checkUnclaimedDope;
