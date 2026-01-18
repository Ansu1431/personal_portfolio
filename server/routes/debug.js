const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/debug/messages - return raw messages for debugging
router.get('/debug/messages', async (req, res) => {
  try {
    const rows = await db.query('SELECT id, name, email, subject, message, created_at, is_read FROM contact_messages ORDER BY created_at DESC');
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Debug messages error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
