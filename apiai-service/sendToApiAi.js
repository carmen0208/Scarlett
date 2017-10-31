const apiai = require('apiai');
const config = require('../config');
const fbService = require('../fb-service/fb-service');

const apiAiService = apiai(config.API_AI_CLIENT_TOKEN,{
  language: "en",
  requestSource: 'fb'
});

function sendToApiAi(sessionIds, handleApiAiResponse, sender, text) {
  // fbService.sendTypingOn(sender);
  let apiaiRequest = apiAiService.textRequest(text, {
    sessionIds: sessionIds.get(sender)
  });

  apiaiRequest.on('response', (response) => {
    if(response.hasOwnProerty('result')) {
      handleApiAiResponse(sender, response);
    }
  });
  apiaiRequest.on('error', (error) => console.error(error));
  apiaiRequest.end();
}

module.exports = sendToApiAi;
