// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const checkUserStatus = require('../middleware/checkUserStatus');

// GET /api/users
router.get('/', checkUserStatus, async (req, res) => {
  try {
    await pool.query('SET search_path TO task4_app, public');
    const result = await pool.query(`
      SELECT id, name, email, status, is_blocked, is_deleted, created_at, last_login
      FROM users
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users/block
router.post('/block', checkUserStatus, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid or missing "ids" array' });
  }

  try {
    await pool.query('SET search_path TO task4_app, public');
    await pool.query(
      `UPDATE users SET status = 'blocked', is_blocked = true WHERE id = ANY($1::int[])`,
      [ids]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to block users:', err.message);
    res.status(500).json({ error: 'Failed to block users' });
  }
});

// POST /api/users/unblock
router.post('/unblock', checkUserStatus, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid or missing "ids" array' });
  }

  try {
    await pool.query('SET search_path TO task4_app, public');
    await pool.query(
      `UPDATE users SET status = 'active', is_blocked = false WHERE id = ANY($1::int[])`,
      [ids]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to unblock users:', err.message);
    res.status(500).json({ error: 'Failed to unblock users' });
  }
});

// POST /api/users/delete
router.post('/delete', checkUserStatus, async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid or missing "ids" array' });
  }

  try {
    await pool.query('SET search_path TO task4_app, public');
    await pool.query(
      `UPDATE users SET status = 'deleted', is_deleted = true WHERE id = ANY($1::int[])`,
      [ids]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Failed to delete users:', err.message);
    res.status(500).json({ error: 'Failed to delete users' });
  }
});

module.exports = router;
