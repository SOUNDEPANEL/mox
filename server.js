require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');

const app = express();

// Security headers
app.disable('x-powered-by');
app.use(helmet());

// Rate limiter
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
}));

// Blokir file sensitif
app.use((req, res, next) => {
  const forbidden = [/\.env$/, /\.git/, /\.map$/, /package-lock\.json$/];
  if (forbidden.some(rx => rx.test(req.url))) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Path folder public
const publicPath = path.join(__dirname, 'public');

// Sajikan file statis (JS, CSS, assets)
app.use(express.static(publicPath));

// API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Vercel server!' });
});

// Semua route SPA diarahkan ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ❗ Jangan gunakan app.listen() di Vercel
module.exports = app;
