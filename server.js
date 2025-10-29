const express = require('express');
const path = require('path');
const helmet = require('helmet');

const app = express();

// Security headers
app.disable('x-powered-by');
app.use(helmet());

// Path folder public
const publicPath = path.join(__dirname, 'public');

// Sajikan file statis (JS, CSS, assets)
app.use(express.static(publicPath));

// Semua route SPA diarahkan ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ❗ Jangan gunakan app.listen() di Vercel
module.exports = app;
