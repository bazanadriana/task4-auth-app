const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET;

const checkUserStatus = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔍 Log the incoming Authorization header
  console.log(`🔐 Incoming Authorization header: ${authHeader}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`⚠️ Unauthorized attempt: Missing or invalid token - ${new Date().toISOString()}`);
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // 🔍 Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    console.log(`✅ JWT verified. Decoded userId: ${userId}`);

    // ❗️No longer rely on search_path — explicitly reference schema
    const result = await pool.query(
      'SELECT status FROM task4_app.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠️ Unauthorized attempt: User not found - ID ${userId} - ${new Date().toISOString()}`);
      return res.status(401).json({ message: 'User not found' });
    }

    const { status } = result.rows[0];
    console.log(`👤 User status: ${status}`);

    if (status === 'blocked') {
      console.warn(`⛔ Blocked user access: ID ${userId} - ${new Date().toISOString()}`);
      return res.status(403).json({ message: 'User is blocked' });
    }

    if (status === 'deleted') {
      console.warn(`⛔ Deleted user access: ID ${userId} - ${new Date().toISOString()}`);
      return res.status(403).json({ message: 'User is deleted' });
    }

    // ✅ Update last_login timestamp
    await pool.query(
      'UPDATE task4_app.users SET last_login = NOW() WHERE id = $1',
      [userId]
    );

    req.user = decoded;
    next();
  } catch (err) {
    console.error(`❌ Token verification failed: ${err.message} - ${new Date().toISOString()}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = checkUserStatus;