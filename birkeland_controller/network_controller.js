const {   currencyForNetwork,
    executeProbe,
    getForwards,
    getGraphEntry,
    getPeers,
    multiPathPayment,
    multiPathProbe,
    openChannel,
    pay,
    probe,
    probeDestination,
    pushPayment,
    reconnect,
    removePeer,
    sendGift,
    setAutopilot,
    transferFunds,} = require("../network");

//1/5: params 
exports.currency_for_network = async(req,res) =>{
    try{
        let {arg} = req.body;
        let resp = await currencyForNetwork(arg);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.execute_probe = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp =await executeProbe(args,()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_forwards= async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await  getForwards(args, ()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_graph_entry= async(req,res) =>{
    try{
        let {filters, fs, lnd, logger, query, sort} = req.body;
        let resp = await  getGraphEntry({filters, fs, lnd, logger, query, sort},()=>{});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_peers= async(req,res) =>{
    try{
        let {args, cbk} = req.body;
        let resp = await  getPeers(args, cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.multi_path_payment= async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await  multiPathPayment(args);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.multi_path_probe= async(req,res) =>{
    try{
        let {args, cbk} = req.body;
        let resp = await  multiPathProbe(args, cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.open_channel= async(req,res) =>{
    try{
        let {args, cbk} = req.body;
        let resp = await  openChannel(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.pay= async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await  pay(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.probe= async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await  probe(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.probe_destination= async(req,res) =>{
    try{
        let {args, cbk} = req.body;
        let resp = await  probeDestination(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.push_payment= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  pushPayment({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.reconnect= async(req,res) =>{
    try{
        let {reconnect_object,cbk} = req.body;
        let {lnd, retries} = reconnect_object;
        let resp = await  reconnect({lnd, retries} ,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.remove_peer= async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await  removePeer(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.send_gift= async(req,res) =>{
    try{
        let {gift_object,cbk} = req.body;
        let {lnd, to, tokens} = gift_object;
        let resp = await  sendGift({lnd, to, tokens},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.set_autopilot= async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await  setAutopilot(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.transfer_funds= async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp = await  transferFunds(args,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}