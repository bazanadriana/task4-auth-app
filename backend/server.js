require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- CORS config ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://task4-frontend.netlify.app',
];

const dynamicOrigin = (origin, callback) => {
  if (!origin) return callback(null, true); // Postman/cURL
  if (/^https:\/\/[\w-]+--task4-frontend\.netlify\.app$/.test(origin)) {
    return callback(null, true); // Netlify deploy previews
  }
  if (allowedOrigins.includes(origin)) {
    return callback(null, true); // Known frontends
  }
  return callback(new Error(`❌ CORS denied for origin: ${origin}`), false);
};

app.use(cors({ origin: dynamicOrigin, credentials: true }));
app.use(express.json());

// --- Test DB connection ---
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  });

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// --- Start server on Render-provided port ---
const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ No PORT specified in environment. Render needs process.env.PORT');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
