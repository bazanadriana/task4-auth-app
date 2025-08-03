// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Route mounting (no full URLs here!)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ✅ Serve frontend from dist
const __dirnameFull = path.resolve();
app.use(express.static(path.join(__dirnameFull, 'frontend', 'dist')));

// ✅ Catch-all route to serve index.html for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirnameFull, 'frontend', 'dist', 'index.html'));
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
