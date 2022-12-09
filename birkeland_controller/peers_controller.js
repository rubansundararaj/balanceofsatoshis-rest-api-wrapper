const { findTagMatch,
    interceptInboundChannels,
    limitForwarding,
    openChannels} = require("../peers");

//1/5: params 
exports.find_tag_match = async(req,res) =>{
    try{
        let {channels, filters, policies, tags, query} = req.body;
        let resp =  findTagMatch({channels, filters, policies, tags, query});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.intercept_inbound_channels = async(req,res) =>{
    try{
        let {address, lnd, logger, reason, rules, trust} = req.body;
        let resp = await interceptInboundChannels({address, lnd, logger, reason, rules, trust},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.limit_forwarding = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await limitForwarding(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.open_channels = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await openChannels(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
