

var express = require("express");
var apirouter = express.Router();

var commands_controller = require("../birkeland_controller/commands_controller")

apirouter.post("/call_raw_api", commands_controller.call_raw_api);
apirouter.post("/fetch_request", commands_controller.fetch_request);
apirouter.post("/interrogate", commands_controller.interrogate);
apirouter.post("/simple_request", commands_controller.simple_request);



module.exports = apirouter;
