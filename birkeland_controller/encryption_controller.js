const {  certExpiration,
    decryptCiphertext,
    decryptPayload,
    decryptWithNode,
    derAsPem,
    encryptToNode,
    encryptToPublicKeys,
    pemAsDer,} = require("../encryption");

//1/5: params 
exports.cert_expiration = async(req,res) =>{
    try{
        let {cert} = req.body;
        let resp = await certExpiration(cert);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.decrypt_cipher_text = async(req,res) =>{
    try{
        let {decrypt_cipher_text_object,cbk} = req.body;
        let {cipher, spawn} = decrypt_cipher_text_object;
        let resp = decryptCiphertext({cipher, spawn},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.decrypt_payload= async(req,res) =>{
    try{
        let {encrypted, secret} = req.body;
        let resp =  decryptPayload({encrypted, secret});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
//4:5 params
exports.decrypt_with_node = async(req,res) =>{
    try{
        let {decrypt_with_node_object,cbk} = req.body;
        let {encrypted, lnd} = decrypt_with_node_object;
        let resp = await decryptWithNode({encrypted, lnd},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.der_as_pem = async(req,res) =>{
    try{
        let {cert, key} = req.body;
        let {index, lnd, reason, route, tagged} = args;
        let resp = derAsPem({ index, lnd, reason, route, tagged }, cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}


exports.encrypt_to_node = async(req,res) =>{
    try{
        //{lnd, message, to}, cbk
        let {encrypt_to_node_object,cbk} = req.body;
        let {lnd, message, to} = encrypt_to_node_object
        let resp = await encryptToNode({lnd, message, to},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.encrypt_to_public_keys = async(req,res) =>{
    try{
        let {encrypt_to_public_key_object,cbk} = req.body;
        let {plain, spawn, to} = encrypt_to_public_key_object
        let resp = await encryptToPublicKeys({plain, spawn, to},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.pem_as_der = async(req,res) =>{
    try{
        let {pem} = req.body;
        let resp = pemAsDer({ pem });
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
