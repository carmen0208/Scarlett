'use strict';
module.exports = {
  sendTypingOn: (recipientId) => {
    let self = module.exports;
    console.log("Turing typing indicator on");
    var messageData = {
      recipient: {
        id: recipientId
      },
      sender_action:"typing_on"
    };
    self.callSendApi(messageDate)
  },

  sendTextMessage: (recipiendId, text) => {
    let self = module.exports;
    var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        text: text
      }
    }
    self.callSendApi(messageData)
  },

  callSendApi: (messageData) => {
    console.log(messageData);
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": facebook_page_token },
      "method": 'POST',
      "json": messageData
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    });
  }
}
