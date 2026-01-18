const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Register payload:', { username, email, password: password ? '***' : null });

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Basic validation with specific messages
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
    }

    // basic email format check
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Prevent registering reserved admin username
    if (username.toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot register reserved username' });
    }

    // Check uniqueness
    const existing = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 0)', [username, email, hash]);

    return res.json({ success: true, message: 'Account created successfully. You can log in now.' });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const rows = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    // Return safe user info + token
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      is_admin: !!user.is_admin
    };

    const token = jwt.sign({ id: user.id, username: user.username, is_admin: !!user.is_admin }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ success: true, message: 'Login successful', user: userData, token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

module.exports = router;
