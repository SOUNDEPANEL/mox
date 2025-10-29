const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

app.disable('x-powered-by');
app.use(helmet());

const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

module.exports = app;
