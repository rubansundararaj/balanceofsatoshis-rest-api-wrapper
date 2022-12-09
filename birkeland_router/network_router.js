

var express = require("express");
var apirouter = express.Router();

var network_controller = require("../birkeland_controller/network_controller")

apirouter.post("/currency_for_network", network_controller.currency_for_network);
apirouter.post("/execute_probe", network_controller.execute_probe);
apirouter.post("/get_forwards", network_controller.get_forwards);
apirouter.post("/get_graph_entry", network_controller.get_graph_entry);
apirouter.post("/get_peers", network_controller.get_peers);
apirouter.post("/multi_path_payment", network_controller.multi_path_payment);

apirouter.post("/multi_path_probe", network_controller.multi_path_probe);
apirouter.post("/open_channel", network_controller.open_channel);
apirouter.post("/pay", network_controller.pay);
apirouter.post("/probe", network_controller.probe);

apirouter.post("/probe_destination", network_controller.probe_destination);
apirouter.post("/push_payment", network_controller.push_payment);
apirouter.post("/reconnect", network_controller.reconnect);

apirouter.post("/remove_peer", network_controller.remove_peer);
apirouter.post("/send_gift", network_controller.send_gift);

apirouter.post("/set_autopilot", network_controller.set_autopilot);
apirouter.post("/transfer_funds", network_controller.transfer_funds);

module.exports = apirouter;
