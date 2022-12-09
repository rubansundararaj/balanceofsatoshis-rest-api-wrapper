

var express = require("express");
var apirouter = express.Router();

var swaps_controller = require("../birkeland_controller/swaps_controller")

apirouter.post("/advertise", swaps_controller.get_paid_service);
apirouter.post("/get_swap_cost", swaps_controller.get_swap_cost);
apirouter.post("/get_swap_service", swaps_controller.get_swap_service);
apirouter.post("/manage_rebalance", swaps_controller.manage_rebalance);
apirouter.post("/rebalance", swaps_controller.rebalance);
apirouter.post("/swap_api_key", swaps_controller.swap_api_key);
apirouter.post("/swap_in", swaps_controller.swap_in);
apirouter.post("/swap_out", swaps_controller.swap_out);

module.exports = apirouter;
