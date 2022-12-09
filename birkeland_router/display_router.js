

var express = require("express");
var apirouter = express.Router();

var display_controller = require("../birkeland_controller/display_controller")

apirouter.post("/chart_alias_for_peer", display_controller.chart_alias_for_peer);
apirouter.post("/describe_confidence", display_controller.describe_confidence);
apirouter.post("/describe_parse_error", display_controller.describe_parse_error);
apirouter.post("/describe_route", display_controller.describe_route);
apirouter.post("/describe_routing_failure", display_controller.describe_routing_failure);
apirouter.post("/format_fee_rate", display_controller.format_fee_rate);
apirouter.post("/get_icons", display_controller.get_icons);
apirouter.post("/is_matching_filters", display_controller.is_matching_filters);
apirouter.post("/segment_measure", display_controller.segment_measure);
apirouter.post("/sums_for_segment", display_controller.sums_for_segment);

module.exports = apirouter;
