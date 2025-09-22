const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();


// Routes
const authRoutes = require('./src/routes/auth');
const victimRoutes = require('./src/routes/victims');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/users');
const searchRoutes = require('./src/routes/search');
const criminalRecordRoutes = require('./src/routes/criminalRecords');
const arrestedRoutes = require('./src/routes/arrested');
const testArrestedRoutes = require('./src/routes/test-arrested');
const victimCriminalRoutes = require('./src/routes/victimCriminal');
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

// Enhanced CORS configuration for auth endpoints
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:6000',
      'http://localhost:5000', 
      'http://localhost:8080',
      'http://127.0.0.1:6000',
      'http://127.0.0.1:5000',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Allow for development and testing
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Trust proxy if behind one (Heroku/Render)
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Session middleware (additive; does not change existing JWT auth)
try {
  const session = require('express-session');
  const pg = require('pg');
  const PgSession = require('connect-pg-simple')(session);

  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  app.use(session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    name: process.env.SESSION_NAME || 'sid',
    secret: process.env.SESSION_SECRET || 'change_me_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: process.env.COOKIE_SAMESITE || 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }));
} catch (e) {
  console.warn('Session setup skipped due to error:', e.message);
}

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

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// Add this after other middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/victims', victimRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/criminal-records', criminalRecordRoutes);
app.use('/api/v1/arrested', arrestedRoutes);
app.use('/api/v1/test-arrested', testArrestedRoutes);
app.use('/api/v1/victim-criminal', victimCriminalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FindSinnerSystem API is running',
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const pool = require('./src/config/database');
    const result = await pool.query('SELECT COUNT(*) as count FROM victim');
    res.json({
      success: true,
      message: 'Database connection successful',
      victim_count: result.rows[0].count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test victim-criminal API without authentication
app.get('/api/test-victim-criminal', async (req, res) => {
  try {
    const pool = require('./src/config/database');
    const query = `
      SELECT 
        v.vic_id,
        v.first_name,
        v.last_name,
        v.id_number,
        v.date_committed,
        v.crime_type as victim_crime_type,
        cr.cri_id as criminal_record_id,
        cr.crime_type as criminal_crime_type,
        cr.date_committed as criminal_date_committed
      FROM victim v
      LEFT JOIN Criminal_record cr ON v.vic_id = cr.vic_id
      LIMIT 5
    `;
    const result = await pool.query(query);
    res.json({
      success: true,
      message: 'Victim-criminal query successful',
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Victim-criminal query failed',
      error: error.message
    });
  }
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