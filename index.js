'user strict'

const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const apiai = require('apiai');
let sendToApiAi = require('./apiai-service/sendToApiAi');
let fbService = require('./fb-service/fb-service');

const facebook_page_token = process.env.FB_PAGE_ACCESS_TOKEN || config.FB_PAGE_ACCESS_TOKEN;

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const sessionIds = new Map();


app.get('/', (req, res) => {
  res.send('Hello World');
});

//facebook webhook
app.get('/webhook', (req, res) => {
  if(req.query['hub.mode'] === "subscribe" && req.query["hub.verify_token"] === config.FB_VERIFY_TOKEN) {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation, Make sure the validation token match");
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  // Parse the request body from the POST
  let body = req.body;
  console.log(JSON.stringify(body));

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      } else {
        console.log("Webhook received unknown messaging Events: ", webhook_event);
      }
    });
    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

function handleMessage(sender_psid, received_message) {
  let response;
  if(received_message.text) {
    // response = {
    //   "text": `You send the message "${received_message.text}". Now send me an image!`
    // }
    sendToApiAi(sessionIds, handleApiAiResponse, sender_psid, received_message.text );
  } else if (received_message.attachments) {
    // Gets the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Is this the right picture?",
          "subtitle": "Tap a button to answer.",
          "image_url": attachment_url,
          "buttons": [
            {
              "type": "postback",
              "title": "Yes!",
              "payload": "yes",
            },
            {
              "type": "postback",
              "title": "No!",
              "payload": "no",
            }
            ],
          }]
        }
      }
    }
  }
  //Sends the response message
  // callSendApi(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
  let response;
  // Get the payload for the postback
  let payload = received_postback.payload;
  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  fbService.sendTextMessage(sender_psid, response);
  // fbService.callSendApi(sender_psid, response);
}

function handleApiAiResponse(sender, response) {
  let responseText = response.result.fulfillment.speech;
  fbService.sendTextMessage(sender, responseText);
}
app.listen(port, ()=> {
  console.log(`Start up at port ${port}`);
});
