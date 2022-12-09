const {createInvoice} = require("../offchain");

//1/5: params 
exports.create_invoice = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await createInvoice(arg,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
