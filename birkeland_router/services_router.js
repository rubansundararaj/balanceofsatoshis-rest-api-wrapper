

var express = require("express");
var apirouter = express.Router();

var services_controller = require("../birkeland_controller/services_controller")

apirouter.post("/advertise", services_controller.advertise);
apirouter.post("/open_balanced_channel", services_controller.open_balanced_channel);
apirouter.post("/service_paid_requests", services_controller.service_paid_requests);
apirouter.post("/use_paid_service", services_controller.use_paid_service);

module.exports = apirouter;
