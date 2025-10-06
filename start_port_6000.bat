@echo off
echo 🚀 Starting server on port 6000...

REM Set environment variables
set PORT=6000
set NODE_ENV=development
set FRONTEND_URL=http://localhost:6000
set CORS_ORIGIN=http://localhost:6000

REM Database Configuration
set DB_HOST=aws-0-eu-west-2.pooler.supabase.com
set DB_PORT=6543
set DB_NAME=postgres
set DB_USER=postgres.ngjvfqelgbjordmt
set DB_PASSWORD=Francois123!@#
set DB_SSL=true

REM JWT Configuration
set JWT_SECRET=your_jwt_secret_key_here
set JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
set JWT_EXPIRES_IN=24h
set JWT_REFRESH_EXPIRES_IN=7d

REM Email Configuration
set EMAIL_HOST=smtp.gmail.com
set EMAIL_PORT=587
set EMAIL_SECURE=false
set EMAIL_USER=uwihoreyefrancois12@gmail.com
set EMAIL_PASS=ngjv fqel gbjo rdmt

echo ✅ Environment variables set for port 6000
echo 🔧 Starting server...
node server.js
