const {callRawApi,fetchRequest,interrogate,simpleRequest} = require("../commands");

//1/5: params 
exports.call_raw_api = async(req,res) =>{
    try{
        let {ask_object, args} = req.body;
        let {ask, lnd, logger, method, params} = ask_object;
        let resp = await callRawApi({ask, lnd, logger, method, params},args);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.fetch_request = async(req,res) =>{
    try{
        let {fetch,cbk} = req.body;
        let resp = await fetchRequest({fetch},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.interrogate= async(req,res) =>{
    try{
       
        let resp = await interrogate({});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
//4:5 params
exports.simple_request = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await simpleRequest(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
