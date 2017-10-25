'user strict'

const express = require('express');

var app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});
app.listen(port, ()=> {
  console.log(`Start up at port ${port}`);
});
