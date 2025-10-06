// Load environment variables first
require('dotenv').config();

const app = require('./app');
const pool = require('./src/config/database');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const PORT = process.env.PORT || 6000;

// Function to kill processes using port 6000
async function killProcessesOnPort(port) {
  try {
    console.log(`🔍 Checking if port ${port} is in use...`);
    
    // Check if port is in use
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (stdout.trim()) {
      console.log(`⚠️  Port ${port} is currently in use!`);
      console.log('🛑 Killing processes using port...');
      
      // Extract PIDs and kill them
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid.match(/^\d+$/)) {
          pids.add(pid);
        }
      });
      
      // Kill each process
      for (const pid of pids) {
        try {
          console.log(`  Killing process ${pid}...`);
          await execAsync(`taskkill /PID ${pid} /F`);
        } catch (killError) {
          // Process might already be dead, continue
        }
      }
      
      console.log('✅ Processes killed!');
      console.log('⏳ Waiting for port to be released...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`✅ Port ${port} is free!`);
    }
  } catch (error) {
    console.log(`✅ Port ${port} is free!`);
  }
}

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

    // Kill any processes using the port before starting
    await killProcessesOnPort(PORT);

    // Start server with error handling
    const server = app.listen(PORT, () => {
      console.log(`🚀 FindSinnerSystem API server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors
    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${PORT} is still in use, retrying...`);
        await killProcessesOnPort(PORT);
        
        // Try again after a short delay
        setTimeout(() => {
          const retryServer = app.listen(PORT, () => {
            console.log(`🚀 FindSinnerSystem API server running on port ${PORT} (retry successful)`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
          });
          
          retryServer.on('error', (retryError) => {
            console.error('❌ Failed to start server after retry:', retryError.message);
            process.exit(1);
          });
        }, 1000);
      } else {
        console.error('❌ Server error:', error.message);
        process.exit(1);
      }
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