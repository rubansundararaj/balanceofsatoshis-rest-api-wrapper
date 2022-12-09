const {     adjustTags,
    getSavedCredentials,
    getSavedNodes,
    manageSavedNodes,} = require("../nodes");

//1/5: params 
exports.adjust_tags = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await adjustTags(arg,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.get_saved_credentials = async(req,res) =>{
    try{
        let {fs, node} = req.body;
        let resp =await getSavedCredentials({fs, node},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_saved_nodes= async(req,res) =>{
    try{
        let {fs, network} = req.body;
        let resp = await  getSavedNodes({fs, network}, ()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_saved_nodes= async(req,res) =>{
    try{
        let {fs, network} = req.body;
        let resp = await  getSavedNodes({fs, network},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.manage_saved_nodes= async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await  manageSavedNodes(args, ()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
