require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
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
  console.warn(`❌ CORS denied for origin: ${origin}`);
  return callback(new Error(`CORS denied for origin: ${origin}`), false);
};

app.use((req, res, next) => {
  console.log(`🌐 Request from origin: ${req.headers.origin}`);
  next();
});

app.use(cors({ origin: dynamicOrigin, credentials: true }));
app.use(express.json());

pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  });

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('✅ Task 4 backend is running.');
});

const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ No PORT specified in environment. Render needs process.env.PORT');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});