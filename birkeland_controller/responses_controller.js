const { returnChart, returnNumber, returnObject, returnOutput} = require("../responses");

//1/5: params 
exports.return_chart = async(req,res) =>{
    try{
        let {data, logger, reject, resolve} = req.body;
        let resp =  returnChart({data, logger, reject, resolve});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//1/5: params 
exports.return_number = async(req,res) =>{
    try{
        let {logger, number, reject, resolve} = req.body;
        let resp = returnNumber({logger, number, reject, resolve});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.return_object = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = returnObject({exit, file, logger, reject, resolve, table, write});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.return_output = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = returnOutput({logger, reject, resolve});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
