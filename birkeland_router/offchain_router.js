

var express = require("express");
var apirouter = express.Router();

var offchain_controller = require("../birkeland_controller/offchain_controller")

apirouter.post("/create_invoice", offchain_controller.create_invoice);


module.exports = apirouter;
