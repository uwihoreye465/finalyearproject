const fs = require('fs');
const path = require('path');

console.log('🔧 Gmail Email Setup Helper');
console.log('============================');

console.log('\n📋 Step 1: Enable 2-Factor Authentication');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Click "Security" in the left sidebar');
console.log('3. Under "Signing in to Google", click "2-Step Verification"');
console.log('4. Follow the steps to enable 2-factor authentication');

console.log('\n🔑 Step 2: Generate App Password');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Click "Security" in the left sidebar');
console.log('3. Under "Signing in to Google", click "App passwords"');
console.log('4. Select "Mail" from the dropdown');
console.log('5. Select "Other (Custom name)"');
console.log('6. Enter "FindSinners System" as the name');
console.log('7. Click "Generate"');
console.log('8. Copy the 16-character password (e.g., abcd efgh ijkl mnop)');

console.log('\n📝 Step 3: Create .env File');
console.log('Create a .env file in your project root with:');

const envContent = `# Database Configuration
DATABASE_URL=your_database_url_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=uwihoreyefrancois12@gmail.com
EMAIL_PASS=YOUR_16_CHARACTER_APP_PASSWORD_HERE

# Server Configuration
PORT=6000
NODE_ENV=development
FRONTEND_URL=http://localhost:6000

# Session Configuration
SESSION_SECRET=your_session_secret_here`;

console.log('\n' + envContent);

console.log('\n🧪 Step 4: Test Email Configuration');
console.log('After setting up the .env file, run:');
console.log('node test_gmail_smtp.js');

console.log('\n🚀 Step 5: Start Your Server');
console.log('npm start');

console.log('\n📧 Step 6: Test Registration');
console.log('Use Postman or curl to test registration:');
console.log('POST http://localhost:6000/api/v1/auth/register');
console.log('Body: {');
console.log('  "sector": "Kigali",');
console.log('  "fullname": "Test User",');
console.log('  "position": "Police Officer",');
console.log('  "email": "uwihoreyefrancois12@gmail.com",');
console.log('  "password": "TestPassword123!",');
console.log('  "role": "staff"');
console.log('}');

console.log('\n✅ Expected Results:');
console.log('- Server starts with "✅ Gmail SMTP connection verified successfully"');
console.log('- Registration sends verification email');
console.log('- You receive email in your Gmail inbox');
console.log('- Email contains verification button');

console.log('\n❌ Common Issues:');
console.log('1. "Invalid login: 535 5.7.8 Authentication failed"');
console.log('   → Check your App Password is correct');
console.log('2. "Email not received"');
console.log('   → Check spam/junk folder');
console.log('   → Verify EMAIL_PASS is set correctly');
console.log('3. "Connection timeout"');
console.log('   → Check internet connection');
console.log('   → Verify Gmail SMTP settings');

console.log('\n🎯 Quick Fix:');
console.log('If you have your App Password, run:');
console.log('set EMAIL_PASS=your_16_character_app_password');
console.log('node test_gmail_smtp.js');
