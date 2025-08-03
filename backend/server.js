require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // make sure DATABASE_URL is used in db.js
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Dynamic CORS origin check ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://task4-frontend.netlify.app',
];

const dynamicOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (/^https:\/\/[\w-]+--task4-frontend\.netlify\.app$/.test(origin)) {
    return callback(null, true);
  }
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error(`❌ CORS denied for origin: ${origin}`), false);
};

app.use(cors({
  origin: dynamicOrigin,
  credentials: true,
}));

app.use(express.json());

// --- Test DB connection on startup ---
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
