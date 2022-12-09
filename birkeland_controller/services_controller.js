const {    advertise,
    openBalancedChannel,
    servicePaidRequests,
    usePaidService,} = require("../services");

//1/5: params 
exports.advertise = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await advertise(arg,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.open_balanced_channel = async(req,res) =>{
    try{
        let {address, after, ask, lnd, logger, recover} = req.body;
        let resp = await openBalancedChannel({address, after, ask, lnd, logger, recover},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.service_paid_requests = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await servicePaidRequests(arg);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.use_paid_service = async(req,res) =>{
    try{
        let {ask, fs, lnd, logger, network, node} = req.body;
        let resp = await usePaidService({ask, fs, lnd, logger, network, node},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
