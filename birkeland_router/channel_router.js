

var express = require("express");
var apirouter = express.Router();

var chain_controller = require("../birkeland_controller/chain_controller")

apirouter.post("/fund_transaction", chain_controller.fund_transaction);
apirouter.post("/get_address_utxo", chain_controller.get_address_utxo);
apirouter.post("/get_chain_fee", chain_controller.get_chain_fee);
apirouter.post("/get_channel_closes", chain_controller.get_channel_closes);
apirouter.post("/get_deposit_address", chain_controller.get_deposit_address);
apirouter.post("/get_mempool_size", chain_controller.get_mempool_size);
apirouter.post("/get_raw_transaction", chain_controller.get_raw_transaction);
apirouter.post("/get_utxos", chain_controller.get_utxos);
apirouter.post("/split_utxos", chain_controller.split_utxos);
apirouter.post("/recover_p2pk", chain_controller.recover_p2pk);







module.exports = apirouter;
