


const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors()); 





var balances_router = require("./birkeland_router/balances_router");
app.use('/balances',balances_router);



app.get("/",(req,res)=>{

    res.send("Balances of Statoshi API endpoint is running");
  });

  const port = 7080;
  
  app.listen(port, () => 
{
    console.log('Running on port ' + port);
});

module.exports = app;