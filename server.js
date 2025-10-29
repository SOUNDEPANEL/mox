// server.js (untuk Vercel)
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.disable('x-powered-by');

// Helmet dengan CSP dasar
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  }
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));

// Blokir file sensitif
app.use((req, res, next) => {
  const forbidden = [/\.env$/i, /\.git/i, /\.map$/i, /package-lock\.json$/i];
  if (forbidden.some(rx => rx.test(req.url))) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Static files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Contoh API endpoint
app.get('/api/do-work', async (req, res) => {
  res.json({ ok: true, brief: "hasil dari server vercel" });
});

// Default: kirim index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ❗JANGAN pakai app.listen di Vercel
module.exports = app;
