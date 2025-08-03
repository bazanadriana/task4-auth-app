const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://688f0b8176be91798a098463--task4-frontend.netlify.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // needed if you're using cookies or Authorization headers
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ API routes only — Netlify serves frontend
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ (Optional) Basic test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Backend is working!' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
