'user strict'

const config = require('./config');
const express = require('express');
const bodyPraser = require('body-parser);

var app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

//facebook webhook
app.get('webhook', (req, res) => {
  if(req.query['hub.mode'] === "subscribe" && req.query["hub.verify_token"] === config.FB_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation, Make sure the validation token match");
    res.sendStatus(403);
  }
});


app.listen(port, ()=> {
  console.log(`Start up at port ${port}`);
});
