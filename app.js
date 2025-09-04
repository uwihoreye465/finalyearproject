const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes = require('./src/routes/auth');
const victimRoutes = require('./src/routes/victims');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/users');
const searchRoutes = require('./src/routes/search');
const criminalRecordRoutes = require('./src/routes/criminalRecords');

// Middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();


app.use((req, res, next) => {
  if (req.get('Content-Type') === 'text/plain') {
    console.log('📝 Handling text/plain content type');
    
    let data = '';
    req.on('data', chunk => {
      data += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('Raw text data received:', data);
      try {
        if (data.trim()) {
          req.body = JSON.parse(data);
          console.log('Parsed JSON from text:', req.body);
        } else {
          req.body = {};
          console.log('Empty text body');
        }
        next();
      } catch (error) {
        console.error('JSON parse error:', error);
        res.status(400).json({
          success: false,
          message: 'Invalid JSON in text/plain body',
          error: error.message
        });
      }
    });
  } else {
    next();
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:6000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// Body parsing middleware - MUST come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ ADD THIS: Handle text/plain content type (for Postman issues)
app.use((req, res, next) => {
  if (req.get('Content-Type') === 'text/plain' && typeof req.body === 'string' && req.body.trim() !== '') {
    try {
      console.log('Converting text/plain to JSON:', req.body);
      req.body = JSON.parse(req.body);
      // Set the content type to JSON for downstream middleware
      req.headers['content-type'] = 'application/json';
    } catch (parseError) {
      console.error('Failed to parse text/plain as JSON:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in text/plain body. Please use Content-Type: application/json or send valid JSON.',
        error: parseError.message
      });
    }
  }
  next();
});

// Debugging middleware
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  console.log('Content-Type:', req.get('Content-Type'));
  console.log('Request body:', req.body);
  next();
});

// API routes
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/victims', victimRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/criminal-records', criminalRecordRoutes);

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