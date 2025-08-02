const pool = require('../db/db');

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, status, created_at,
        CASE WHEN status = 'blocked' THEN true ELSE false END AS is_blocked,
        CASE WHEN status = 'deleted' THEN true ELSE false END AS is_deleted
      FROM users
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error in getUsers:', err.message);
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
};



