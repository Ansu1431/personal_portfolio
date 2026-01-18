const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Save as resume.pdf (overwrite) or keep original name
    const ext = path.extname(file.originalname).toLowerCase();
    const name = file.fieldname === 'resume' ? 'resume' : path.basename(file.originalname, ext);
    cb(null, name + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowed = ['.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// POST /api/upload-resume
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    // Return public path relative to server root
    const publicPath = '/uploads/' + req.file.filename;
    // If userId provided in the form data, persist resume path to the user's DB row
    const userId = req.body && (req.body.userId || req.body.user_id);
    // verify that the requester is the owner or admin
    const { getUserFromReq } = require('../middleware/authMiddleware');
    const requester = getUserFromReq(req);
    if (!requester) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!requester.is_admin) {
      if (!userId || String(requester.id) !== String(userId)) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }
    }
    if (userId) {
      try {
        await db.query('UPDATE users SET resume_path = ? WHERE id = ?', [publicPath, userId]);
        console.log(`Saved resume path for user ${userId}`);
      } catch (err) {
        console.error('Failed to save resume path to DB', err);
      }
    }
    return res.json({ success: true, message: 'Resume uploaded', path: publicPath });
  } catch (err) {
    console.error('Upload error', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
