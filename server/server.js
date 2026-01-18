const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// API routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const dashboardRoutes = require('./routes/dashboard');
const debugRoutes = require('./routes/debug');
const uploadRoutes = require('./routes/upload');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API
app.use('/api', authRoutes);
app.use('/api', contactRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', debugRoutes);
app.use('/api', uploadRoutes);

// Serve static frontend from project root
const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));

// Serve uploaded files (uploads/)
app.use('/uploads', express.static(path.join(staticRoot, 'uploads')));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
