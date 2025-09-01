const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes = require('./src/routes/auth');
// const sinnerRoutes = require('./src/routes/sinners');
const victimRoutes = require('./src/routes/victims');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/users');
const searchRoutes = require('./src/routes/search'); // CORRECTED PATH
// Add this line with other route imports
const criminalRecordRoutes = require('./src/routes/criminalRecords');

// Add this line with other route registrations

// Middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
   message: 'Too many requests from this IP, please try again later.'
 }
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes

app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/sinners', sinnerRoutes);
// app.use('/api/victims', victimRoutes);
app.use('/api/victims', victimRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/criminal-records', criminalRecordRoutes);
// Health check endpoint
app.get('/api/health', (req, res) => {
 res.json({ 
   success: true, 
   message: 'FindSinnerSystem API is running',
   timestamp: new Date().toISOString()
 });
});

// 404 handler
app.use('*', (req, res) => {
 res.status(404).json({
   success: false,
   message: 'API endpoint not found'
 });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;