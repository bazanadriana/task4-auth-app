const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    await pool.query("SET search_path TO task4_app");

    const existingUser = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('❌ Registration error:', err);

    if (err.code === '23505') {
      return res.status(400).json({ message: 'Email already exists (constraint)' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    await pool.query("SET search_path TO task4_app");

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (user.is_deleted) {
      return res.status(403).json({ message: 'Account deleted' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Account blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const token = jwt.sign(
      { userId: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { registerUser, loginUser };