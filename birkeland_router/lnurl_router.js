

var express = require("express");
var apirouter = express.Router();

var lnurl_controller = require("../birkeland_controller/lnurl_controller")

apirouter.post("/get_lnurl_request", lnurl_controller.get_lnurl_request);
apirouter.post("/manage_lnurl", lnurl_controller.manage_lnurl);
apirouter.post("/parse_url", lnurl_controller.parse_url);


module.exports = apirouter;
