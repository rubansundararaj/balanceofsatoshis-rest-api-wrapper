

var express = require("express");
var apirouter = express.Router();

var responses_controller = require("../birkeland_controller/responses_controller")

apirouter.post("/return_chart", responses_controller.return_chart);
apirouter.post("/return_number", responses_controller.return_number);
apirouter.post("/return_object", responses_controller.return_object);
apirouter.post("/return_output", responses_controller.return_output);

module.exports = apirouter;
