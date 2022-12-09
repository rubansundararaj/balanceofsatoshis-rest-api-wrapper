

var express = require("express");
var apirouter = express.Router();

var wallet_controller = require("../birkeland_controller/wallet_controller")

apirouter.post("/advertise", wallet_controller.clean_failed_payments);
apirouter.post("/get_received_chart", wallet_controller.get_received_chart);
apirouter.post("/get_report", wallet_controller.get_report);
apirouter.post("/unlock_wallet", wallet_controller.unlock_wallet);

module.exports = apirouter;
