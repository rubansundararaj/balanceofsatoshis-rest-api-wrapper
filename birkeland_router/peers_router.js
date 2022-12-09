

var express = require("express");
var apirouter = express.Router();

var peers_controller = require("../birkeland_controller/peers_controller")

apirouter.post("/find_tag_match", peers_controller.find_tag_match);
apirouter.post("/intercept_inbound_channels", peers_controller.intercept_inbound_channels);
apirouter.post("/limit_forwarding", peers_controller.limit_forwarding);
apirouter.post("/open_channels", peers_controller.open_channels);

module.exports = apirouter;
