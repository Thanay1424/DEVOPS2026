require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const seedDatabase = require('./services/seedService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const crimeStatsRoutes = require('./routes/crimeStatsRoutes');

const app = express();

// Connect to MongoDB
connectDB().then(() => seedDatabase());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', authRoutes);
app.use('/api/crime-stats', crimeStatsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Crime Index Dashboard API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Serve login page as default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

// Serve reports
app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'reports.html'));
});

// Serve admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   🔍 Crime Index Analytics Dashboard       ║');
  console.log('╠════════════════════════════════════════════╣');
  console.log(`║   Server  → http://localhost:${PORT}           ║`);
  console.log(`║   Env     → ${process.env.NODE_ENV || 'development'}                   ║`);
  console.log('╚════════════════════════════════════════════╝');
  console.log('');
});

// Graceful shutdown
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
