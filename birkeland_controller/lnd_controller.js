const {  authenticatedLnd,
    findRecord,
    gateway,
    getCertValidityDays,
    getCredentials,
    getLnds,
    lndCredentials} = require("../lnd");

//1/5: params 
exports.authenticated_lnd = async(req,res) =>{
    try{
        let {authenticated_lnd_object,cbk} = req.body;
        let {logger, node} = authenticated_lnd_object;
        let resp = await authenticatedLnd({logger, node} ,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.find_record = async(req,res) =>{
    try{
        let {find_record_object,cbk} = req.body;
        let {lnd, query} = find_record_object;
        let resp =await findRecord({lnd, query},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.gateway= async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await  gateway(args);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
//4:5 params
exports.get_cert_validity_days = async(req,res) =>{
    try{
        let {cert_validation_days_object,cbk} = req.body;
        let {below, logger, node} = cert_validation_days_object;
        let resp = await getCertValidityDays({below, logger, node},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_credentials = async(req,res) =>{
    try{
        let {args, cbk} = req.body;
        let resp = await getCredentials(args, cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}


exports.get_lnds = async(req,res) =>{
    try{
        //{lnd, message, to}, cbk
        let {get_lnds_objects,cbk} = req.body;
        let {logger, nodes} = get_lnds_objects;
        let resp = await getLnds({logger, nodes},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.lnd_credentials = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await lndCredentials(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
