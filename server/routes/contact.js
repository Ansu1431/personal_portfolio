const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    console.log('Contact payload:', { name, email, subject, message: message ? message.slice(0,50) + (message.length>50?'...':'') : null });
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const result = await db.query('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message]);
    console.log('Inserted contact message result:', result);
    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Contact error', err);
    return res.status(500).json({ success: false, message: 'Server error while sending message' });
  }
});

module.exports = router;
