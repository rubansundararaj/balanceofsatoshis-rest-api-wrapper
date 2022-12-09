

var express = require("express");
var apirouter = express.Router();

var lnd_controller = require("../birkeland_controller/lnd_controller")

apirouter.post("/authenticated_lnd", lnd_controller.authenticated_lnd);
apirouter.post("/find_record", lnd_controller.find_record);
apirouter.post("/gateway", lnd_controller.gateway);
apirouter.post("/get_cert_validity_days", lnd_controller.get_cert_validity_days);
apirouter.post("/get_credentials", lnd_controller.get_credentials);
apirouter.post("/get_lnds", lnd_controller.get_lnds);
apirouter.post("/lnd_credentials", lnd_controller.lnd_credentials);

module.exports = apirouter;
