

var express = require("express");
var apirouter = express.Router();

var routing_controller = require("../birkeland_controller/routing_controller")

apirouter.post("/adjust_fees", routing_controller.adjust_fees);
apirouter.post("/channel_for_gift", routing_controller.channel_for_gift);
apirouter.post("/channels_from_hints", routing_controller.channels_from_hints);
apirouter.post("/get_chain_fees_chart", routing_controller.get_chain_fees_chart);
apirouter.post("/get_fees_chart", routing_controller.get_fees_chart);
apirouter.post("/get_fees_paid", routing_controller.get_fees_paid);
apirouter.post("/get_ignores", routing_controller.get_ignores);
apirouter.post("/get_past_forwards", routing_controller.get_past_forwards);
apirouter.post("/ignore_from_avoid", routing_controller.ignore_from_avoid);
apirouter.post("/gift_route", routing_controller.gift_route);

module.exports = apirouter;
