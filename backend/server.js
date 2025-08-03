const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Dynamic CORS origin check ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://task4-frontend.netlify.app',
];

const dynamicOrigin = (origin, callback) => {
  // Allow undefined origins (like curl/Postman)
  if (!origin) return callback(null, true);

  // Accept Netlify deploy preview domains
  if (/^https:\/\/[\w-]+--task4-frontend\.netlify\.app$/.test(origin)) {
    return callback(null, true);
  }

  // Allow explicit whitelisted origins
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Otherwise, block
  return callback(new Error(`❌ CORS denied for origin: ${origin}`), false);
};

app.use(cors({
  origin: dynamicOrigin,
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});