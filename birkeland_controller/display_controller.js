const {  chartAliasForPeer,
    describeConfidence,
    describeParseError,
    describeRoute,
    describeRoutingFailure,
    formatFeeRate,
    getIcons,
    isMatchingFilters,
    segmentMeasure,
    sumsForSegment,} = require("../display");

//1/5: params 
exports.chart_alias_for_peer = async(req,res) =>{
    try{
        let {args} = req.body;
        let resp = await chartAliasForPeer(args);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//2/5: params 
exports.describe_confidence = async(req,res) =>{
    try{
        let {confidence} = req.body;
        let resp = describeConfidence({confidence});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

//3/5: params 
exports.describe_parse_error= async(req,res) =>{
    try{
        let {error} = req.body;
        let resp = await describeParseError(error);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}
//4:5 params
exports.describe_route = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let {lnd, route, tagged} = args;
        let resp = await describeRoute({lnd, route, tagged},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.describe_routing_failure = async(req,res) =>{
    try{
        let {args,cbk} = req.body;
        let {index, lnd, reason, route, tagged} = args;
        let resp = await describeRoutingFailure({index, lnd, reason, route, tagged},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}


exports.format_fee_rate = async(req,res) =>{
    try{
        let {rate} = req.body;
        let resp = await formatFeeRate(rate);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.get_icons = async(req,res) =>{
    try{
        let {fs,cbk} = req.body;
        let resp = await getIcons({fs},cbk);
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.is_matching_filters = async(req,res) =>{
    try{
        let {filters,variables} = req.body;
        let resp = isMatchingFilters({filters,variables});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.segment_measure = async(req,res) =>{
    try{
        let {days, end, start} = req.body;
        let resp = await segmentMeasure({days, end, start});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}

exports.sums_for_segment = async(req,res) =>{
    try{
        let {end, measure, records, segments}= req.body;
        let resp = await sumsForSegment({end, measure, records, segments});
        return res.status(200).send({success : true, message : resp});
    }
    catch(err){
        return res.status(400).send({success : false});
    }
}