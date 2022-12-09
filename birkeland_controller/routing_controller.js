const {  adjustFees,
    channelForGift,
    channelsFromHints,
    getChainFeesChart,
    getFeesChart,
    getFeesPaid,
    getIgnores,
    getPastForwards,
    giftRoute,
    ignoreFromAvoid,} = require("../routing");

//1/5: params 
exports.adjust_fees = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await adjustFees(arg,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.channel_for_gift = async(req,res) =>{
    try{
        let {channels, to, tokens} = req.body;
        let resp = channelForGift({channels, to, tokens});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.channels_from_hints = async(req,res) =>{
    try{
        let {request} = req.body;
        let resp = channelsFromHints({request});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_chain_fees_chart = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp =await getChainFeesChart(args, ()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_fees_chart = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await getFeesChart(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_fees_paid = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await getFeesPaid(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_ignores = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = getIgnores(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_past_forwards = async(req,res) =>{
    try{
        let {days, lnd} = req.body;
        let resp = getPastForwards({days, lnd},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.gift_route = async(req,res) =>{
    try{
        let {channel, destination, height, payment, tokens} = req.body;
        let resp = giftRoute({channel, destination, height, payment, tokens});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.ignore_from_avoid = async(req,res) =>{
    try{
        let {avoid} = req.body;
        let resp = ignoreFromAvoid({avoid});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}