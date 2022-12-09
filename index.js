


const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors()); 


var balances_router = require("./birkeland_router/balances_router");
app.use('/balances',balances_router);

var channel_router = require("./birkeland_router/channel_router");
app.use('/channel',channel_router);

var commands_router = require("./birkeland_router/commands_router");
app.use('/commands',commands_router);

var display_router = require("./birkeland_router/display_router");
app.use('/display',display_router);

var encryption_router = require("./birkeland_router/encryption_router");
app.use('/encryption',encryption_router);

var lnd_router = require("./birkeland_router/lnd_router");
app.use('/lnd',lnd_router);

var lnurl_router = require("./birkeland_router/lnurl_router");
app.use('/lnurl',lnurl_router);

var network_router = require("./birkeland_router/network_router");
app.use('/network',network_router);

var nodes_router = require("./birkeland_router/nodes_router");
app.use('/nodes',nodes_router);

var offchain_router = require("./birkeland_router/offchain_router");
app.use('/offchain',offchain_router);

var peers_router = require("./birkeland_router/peers_router");
app.use('/peers',peers_router);

var response_router = require("./birkeland_router/response_router");
app.use('/response',response_router);

var routing_router = require("./birkeland_router/routing_router");
app.use('/routing',routing_router);

var services_router = require("./birkeland_router/services_router");
app.use('/services',services_router);

var swaps_router = require("./birkeland_router/swaps_router");
app.use('/swaps',swaps_router);

var wallet_router = require("./birkeland_router/wallet_router");
app.use('/wallet',wallet_router);

app.get("/",(req,res)=>{

    res.send("Balances of Statoshi API endpoint is running");
  });

  const port = 7080;
  
  app.listen(port, () => 
{
    console.log('Running on port ' + port);
});

module.exports = app;