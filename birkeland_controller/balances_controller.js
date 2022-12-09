const { balanceFromTokens,getAccountingReport,getBalance,getLiquidity,getDetailedBalance,
} = require("../balances");

//1/5: params 
exports.get_balances_from_token = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await balanceFromTokens(args);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.get_accounting_report = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getAccountingReport(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_balances= async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getBalance(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
//4:5 params
exports.get_detailed_balance = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getDetailedBalance(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//5/5 params
exports.get_liquidity = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getLiquidity(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}