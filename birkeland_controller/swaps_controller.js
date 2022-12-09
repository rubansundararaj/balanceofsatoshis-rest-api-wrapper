const {     getPaidService,
    getSwapCost,
    getSwapService,
    manageRebalance,
    rebalance,
    swapApiKey,
    swapIn,
    swapOut,} = require("../swaps");

//1/5: params 
exports.get_paid_service = async(req,res) =>{
    try{
        let {fetch, lnd, socket, token} = req.body;
        let resp = await getPaidService({fetch, lnd, socket, token},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.get_swap_cost = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await getSwapCost(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.get_swap_service = async(req,res) =>{
    try{
        let {logger, node} = req.body;
        let resp = await getSwapService({logger, node},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.manage_rebalance = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await manageRebalance(arg,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.rebalance = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await rebalance(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.swap_api_key = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await swapApiKey(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}


//1/5: params 
exports.swap_in = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await swapIn(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}


//1/5: params 
exports.swap_out = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await swapOut(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

