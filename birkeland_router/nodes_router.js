

var express = require("express");
var apirouter = express.Router();

var nodes_controller = require("../birkeland_controller/nodes_controller")

apirouter.post("/adjust_tags", nodes_controller.adjust_tags);
apirouter.post("/get_saved_credentials", nodes_controller.get_saved_credentials);
apirouter.post("/get_saved_nodes", nodes_controller.get_saved_nodes);
apirouter.post("/manage_saved_nodes", nodes_controller.manage_saved_nodes);

module.exports = apirouter;
