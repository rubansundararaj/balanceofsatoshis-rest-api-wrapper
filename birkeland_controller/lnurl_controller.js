const {  getLnurlRequest, manageLnurl, parseUrl} = require("../lnurl");

//1/5: params 
exports.get_lnurl_request = async(req,res) =>{
    try{
        let {ln_url_object,cbk} = req.body;
        let {lnurl, request, tokens} = ln_url_object;
        let resp = await getLnurlRequest({lnurl, request, tokens} ,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.manage_lnurl = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp =await manageLnurl({args,cbk});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.parse_url= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  parseUrl({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}