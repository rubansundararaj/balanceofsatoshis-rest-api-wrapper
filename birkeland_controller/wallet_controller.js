const {     cleanFailedPayments,
    getReceivedChart,
    getReport,
    unlockWallet,} = require("../wallets");

//1/5: params 
exports.clean_failed_payments = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await cleanFailedPayments(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.get_received_chart = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await getReceivedChart(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.get_report = async(req,res) =>{
    try{
        let {fs, node, request, style} = req.body;
        let resp = await getReport({fs, node, request, style},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.unlock_wallet = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await unlockWallet(arg,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
