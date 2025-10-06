// Backend Configuration for Flutter Integration
// Add this to your app.js or server.js

const cors = require('cors');

// Configure CORS for Flutter development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',     // Flutter web development
      'http://127.0.0.1:3000',    // Alternative localhost
      'http://localhost:8080',     // Alternative Flutter port
      'http://127.0.0.1:8080',    // Alternative Flutter port
      // Add your production Flutter app domains here
      // 'https://your-flutter-app.com',
      // 'https://your-flutter-app.netlify.app',
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Additional middleware for Flutter
app.use((req, res, next) => {
  // Add headers for Flutter compatibility
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

console.log('✅ CORS configured for Flutter integration');
