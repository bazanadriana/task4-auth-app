const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ Allow multiple trusted origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://688f122a03a5b6aa98773305--task4-frontend.netlify.app',
  'https://task4-frontend.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn(`Blocked CORS origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ Do not serve frontend, Netlify does that
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
