const {   currencyForNetwork,
    executeProbe,
    getForwards,
    getGraphEntry,
    getPeers,
    multiPathPayment,
    multiPathProbe,
    networks,
    openChannel,
    pay,
    peerSortOptions,
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
        let {ln_url_object,cbk} = req.body;
        let {lnurl, request, tokens} = ln_url_object;
        let resp = await currencyForNetwork({lnurl, request, tokens} ,cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.execute_probe = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let resp =await executeProbe({args,cbk});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_forwards= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  getForwards({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_graph_entry= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  getGraphEntry({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.get_peers= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  getPeers({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.multi_path_payment= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  multiPathPayment({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.multi_path_probe= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  multiPathProbe({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.networks= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  networks({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.open_channel= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  openChannel({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.pay= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  pay({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.probe= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  probe({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.probe_destination= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  probeDestination({url});
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
        let {url} = req.body;
        let resp = await  reconnect({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.remove_peer= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  removePeer({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.send_gift= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  sendGift({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.set_autopilot= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  setAutopilot({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.transfer_funds= async(req,res) =>{
    try{
        let {url} = req.body;
        let resp = await  transferFunds({url});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}