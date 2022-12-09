

var express = require("express");
var apirouter = express.Router();

var balances_controller = require("../birkeland_controller/balances_controller")

apirouter.post("/get_balances_from_token", balances_controller.get_balances_from_token);
apirouter.post("/get_accounting_report", balances_controller.get_accounting_report);
apirouter.post("/get_balances", balances_controller.get_balances);
apirouter.post("/get_liquidity", balances_controller.get_liquidity);
apirouter.post("/get_detailed_balance", balances_controller.get_detailed_balance);









module.exports = apirouter;
