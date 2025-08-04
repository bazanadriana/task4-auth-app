const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const checkUserStatus = require('../middleware/checkUserStatus');

// ✅ GET all users (requires auth)
router.get('/', checkUserStatus, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, is_admin, is_blocked, is_deleted, last_login FROM users ORDER BY last_login DESC NULLS LAST'
    );

    const users = result.rows.map(u => ({
      ...u,
      status: u.is_deleted
        ? 'Deleted'
        : u.is_blocked
        ? 'Blocked'
        : 'Active',
    }));

    res.json(users);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err.message);
    res.status(500).json({ message: 'Failed to load users' });
  }
});

// ✅ Block users by IDs
router.post('/block', checkUserStatus, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }

  try {
    await pool.query(
      'UPDATE users SET is_blocked = true WHERE id = ANY($1::int[])',
      [ids]
    );
    res.json({ message: 'Users blocked successfully' });
  } catch (err) {
    console.error('❌ Failed to block users:', err.message);
    res.status(500).json({ message: 'Error blocking users' });
  }
});

// ✅ Unblock users by IDs
router.post('/unblock', checkUserStatus, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }

  try {
    await pool.query(
      'UPDATE users SET is_blocked = false WHERE id = ANY($1::int[])',
      [ids]
    );
    res.json({ message: 'Users unblocked successfully' });
  } catch (err) {
    console.error('❌ Failed to unblock users:', err.message);
    res.status(500).json({ message: 'Error unblocking users' });
  }
});

// ✅ Delete users by IDs
router.post('/delete', checkUserStatus, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'No user IDs provided' });
  }

  try {
    await pool.query(
      'UPDATE users SET is_deleted = true WHERE id = ANY($1::int[])',
      [ids]
    );
    res.json({ message: 'Users deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete users:', err.message);
    res.status(500).json({ message: 'Error deleting users' });
  }
});

module.exports = router;