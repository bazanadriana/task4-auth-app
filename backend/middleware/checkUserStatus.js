const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET;

const checkUserStatus = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const userResult = await pool.query(
      'SELECT status FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    const status = userResult.rows[0].status;

    if (status === 'blocked') {
      return res.status(403).json({ message: 'User is blocked' });
    }

    if (status === 'deleted') {
      return res.status(403).json({ message: 'User is deleted' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('User auth error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = checkUserStatus;
