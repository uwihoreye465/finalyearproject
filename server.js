// Load environment variables first
require('dotenv').config();

const app = require('./app');
const pool = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Test database connection before starting server
async function startServer() {
  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set!');
      console.error('Please create a .env file with your Supabase database URL:');
      console.error('DATABASE_URL=postgresql://username:password@host:port/database');
      process.exit(1);
    }

    // Test database connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 FindSinnerSystem API server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (error.message.includes('SASL') || error.message.includes('password')) {
      console.error('💡 This looks like a database authentication error.');
      console.error('Please check your DATABASE_URL in the .env file.');
    }
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  pool.end();
  process.exit(0);
});

startServer();