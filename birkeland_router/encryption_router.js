

var express = require("express");
var apirouter = express.Router();

var encryption_controller = require("../birkeland_controller/encryption_controller")

apirouter.post("/cert_expiration", encryption_controller.cert_expiration);
apirouter.post("/decrypt_cipher_text", encryption_controller.decrypt_cipher_text);
apirouter.post("/decrypt_payload", encryption_controller.decrypt_payload);
apirouter.post("/decrypt_with_node", encryption_controller.decrypt_with_node);
apirouter.post("/der_as_pem", encryption_controller.der_as_pem);
apirouter.post("/encrypt_to_node", encryption_controller.encrypt_to_node);
apirouter.post("/encrypt_to_public_keys", encryption_controller.encrypt_to_public_keys);
apirouter.post("/pem_as_der", encryption_controller.pem_as_der);


module.exports = apirouter;
