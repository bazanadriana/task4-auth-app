const jwt = require('jsonwebtoken');
const pool = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('❌ JWT_SECRET not set in environment');
}

const checkUserStatus = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(`🔐 Incoming Authorization header: ${authHeader}`);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`⚠️ Unauthorized: Missing/invalid token - ${new Date().toISOString()}`);
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    console.log(`✅ JWT verified. Decoded userId: ${userId}`);

    const result = await pool.query(
      'SELECT status FROM task4_app.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.warn(`⚠️ Unauthorized: User not found - ID ${userId}`);
      return res.status(401).json({ message: 'User not found' });
    }

    const { status } = result.rows[0];
    console.log(`👤 User status: ${status}`);

    if (status === 'blocked') {
      console.warn(`⛔ Blocked user ID ${userId}`);
      return res.status(403).json({ message: 'User is blocked' });
    }

    if (status === 'deleted') {
      console.warn(`⛔ Deleted user ID ${userId}`);
      return res.status(403).json({ message: 'User is deleted' });
    }

    try {
      await pool.query(
        'UPDATE task4_app.users SET last_login = NOW() WHERE id = $1',
        [userId]
      );
    } catch (e) {
      console.warn(`⚠️ Failed to update last_login for user ${userId}: ${e.message}`);
    }

    req.user = decoded;
    req.userId = userId;
    next();
  } catch (err) {
    console.error(`❌ Token verification failed: ${err.message} - ${new Date().toISOString()}`);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = checkUserStatus;