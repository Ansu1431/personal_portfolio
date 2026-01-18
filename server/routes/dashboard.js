const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/dashboard?action=overview|messages|profile|settings
router.get('/dashboard', async (req, res) => {
  try {
    const action = req.query.action || 'overview';
    if (action === 'overview') {
      // only admin can view overview
      const userFromToken = require('../middleware/authMiddleware').getUserFromReq(req);
      if (!userFromToken || !userFromToken.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      // mirror the old PHP response shape expected by frontend
      const totalMessagesRow = await db.query('SELECT COUNT(*) as count FROM contact_messages');
      const unreadRow = await db.query('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0');
      const thisMonthRow = await db.query("SELECT COUNT(*) as count FROM contact_messages WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())");
      const recentActivityRows = await db.query("SELECT name, subject, created_at, 'message' as type FROM contact_messages ORDER BY created_at DESC LIMIT 10");

      const totalMessages = totalMessagesRow[0] ? totalMessagesRow[0].count : 0;
      const unreadMessages = unreadRow[0] ? unreadRow[0].count : 0;
      const thisMonth = thisMonthRow[0] ? thisMonthRow[0].count : 0;

      const formattedActivity = (recentActivityRows || []).map(a => ({
        title: 'New message from ' + a.name,
        description: a.subject,
        type: a.type,
        created_at: a.created_at
      }));

      return res.json({ success: true, data: {
        totalMessages,
        unreadMessages,
        thisMonth,
        totalViews: Math.floor(Math.random() * 900) + 100,
        recentActivity: formattedActivity
      }});
    }

    if (action === 'messages') {
      const userFromToken = require('../middleware/authMiddleware').getUserFromReq(req);
      if (!userFromToken || !userFromToken.is_admin) {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }
      const msgs = await db.query('SELECT id, name, email, subject, message, created_at, is_read FROM contact_messages ORDER BY created_at DESC');
      return res.json({ success: true, data: { messages: msgs } });
    }

    if (action === 'profile') {
      // return profile for the requested user (if userId provided) or fall back to admin
      const userId = req.query.userId;
      let profileRow;
      if (userId) {
        const rows = await db.query('SELECT id, username, email, full_name, resume_path FROM users WHERE id = ? LIMIT 1', [userId]);
        profileRow = rows[0] || {};
      } else {
        const admin = await db.query("SELECT id, username, email, full_name, resume_path FROM users WHERE username = 'admin' LIMIT 1");
        profileRow = admin[0] || {};
      }
      return res.json({ success: true, data: { profile: profileRow } });
    }

    return res.status(400).json({ success: false, message: 'Unknown action' });
  } catch (err) {
    console.error('Dashboard error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
