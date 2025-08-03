// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginUser, registerUser } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/signup
router.post('/signup', registerUser);

module.exports = router;