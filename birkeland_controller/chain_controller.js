const { fundTransaction,getAddressUtxo,getChainFees, getChannelCloses, getMempoolSize, getRawTransaction, getUtxos, recoverP2pk } = require("../chain");



//1/10: params 
exports.fund_transaction = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await fundTransaction(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/10: params 
exports.get_address_utxo = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getAddressUtxo(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/10: params 
exports.get_chain_fee = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getChainFees(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//4/10:  
exports.get_channel_closes = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getChannelCloses(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//5/10:  
exports.get_deposit_address = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getDepositAddress(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//6/10:  
exports.get_mempool_size = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getMempoolSize(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//7/10:  
exports.get_raw_transaction = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getRawTransaction(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//8/10:  
exports.get_utxos = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await getUtxos(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//9/10:  
exports.recover_p2pk = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await recoverP2pk(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//10/10: params
exports.split_utxos = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await splitUtxos(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}