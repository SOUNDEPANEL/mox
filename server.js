// server.js (improved)
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Basic hardening
app.disable('x-powered-by');

// Helmet dengan CSP dasar — sesuaikan jika pakai CDN atau inline styles yang sering
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // tambahkan CDN jika perlu, contoh: "'self' https://cdn.jsdelivr.net"
      styleSrc: ["'self'", "'unsafe-inline'"], // jika perlu 'unsafe-inline' untuk legacy
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"], // penting: API endpoint eksternal jika ada, masukkan di sini
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  // tambahan header lain sudah otomatis oleh helmet
}));

// HSTS: hanya aktif di production (jangan aktifkan saat develop di http)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet.hsts({
    maxAge: 63072000, // 2 tahun
    includeSubDomains: true,
    preload: true
  }));
}

// Rate limiter — sesuaikan nilai untuk production
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS — jangan gunakan '*' di production, isi domain yang valid
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));

// Middleware: blok request untuk file sensitif (.env, .git, .map)
app.use((req, res, next) => {
  const forbidden = [
    /\.env$/i,
    /\.git/i,
    /\.map$/i,           // blok source maps supaya tidak mudah dibaca
    /package-lock\.json$/i
  ];
  if (forbidden.some(rx => rx.test(req.url))) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Static files (public) — setHeaders: mencegah melayani .map dan menambah header
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  index: 'index.html',
  extensions: ['html'],
  setHeaders: (res, filePath) => {
    // jangan kirim source maps
    if (filePath.endsWith('.map')) {
      res.status(403).end();
      return;
    }
    // tambahkan header tambahan
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // cache control: production bisa long-cache, development no-cache
    if (process.env.NODE_ENV === 'production') {
      // static assets boleh di-cache lama
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

// Contoh endpoint API — letakkan di sini semua logic sensitif
// (misal kalkulasi atau panggilan 3rd party dengan API key)
app.get('/api/do-work', async (req, res) => {
  try {
    // contoh: gunakan secret yang hanya ada di server
    const secret = process.env.MY_SECRET_KEY || 'no-secret';
    // lakukan proses/algoritma yang sensitif INI DI SERVER
    const result = { ok: true, brief: "hasil yang aman" };

    // jangan kirim secret ke client
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

app.use((req, res, next) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});


// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
