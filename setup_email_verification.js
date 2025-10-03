const fs = require('fs');
const path = require('path');

console.log('🚀 FindSinners System - Email Verification Setup');
console.log('================================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    
    const envContent = `# Database Configuration
DATABASE_URL=your-supabase-database-url

# Server Configuration
PORT=6000
NODE_ENV=development
FRONTEND_URL=http://localhost:6000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-${Math.random().toString(36).substring(2, 15)}
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-${Math.random().toString(36).substring(2, 15)}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=uwihoreyefrancois12@gmail.com
EMAIL_PASS=your-gmail-app-password-here

# Session Configuration
SESSION_SECRET=your-session-secret-key-here-${Math.random().toString(36).substring(2, 15)}
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');
} else {
    console.log('✅ .env file already exists');
}

// Check if nodemailer is installed
try {
    require('nodemailer');
    console.log('✅ nodemailer is installed');
} catch (error) {
    console.log('❌ nodemailer is not installed. Installing...');
    console.log('Run: npm install nodemailer');
}

console.log('\n📋 Next Steps:');
console.log('==============');
console.log('1. 🔐 Enable 2-Factor Authentication on your Gmail account');
console.log('2. 🔑 Generate an App Password for "FindSinners System"');
console.log('3. ⚙️  Update EMAIL_PASS in your .env file with the App Password');
console.log('4. 🗄️  Update DATABASE_URL in your .env file with your Supabase URL');
console.log('5. 🚀 Start your server: npm start');
console.log('6. 🧪 Test with: node test_email_verification.js');
console.log('7. 🌐 Or use the web interface: test_email_verification.html');

console.log('\n📧 Gmail Setup Instructions:');
console.log('============================');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Security → 2-Step Verification → Turn on');
console.log('3. Security → App passwords → Generate');
console.log('4. Select "Mail" and "Other (Custom name)"');
console.log('5. Enter "FindSinners System" as the name');
console.log('6. Copy the 16-character password');
console.log('7. Paste it as EMAIL_PASS in your .env file');

console.log('\n🔗 API Endpoints:');
console.log('=================');
console.log('POST /api/v1/auth/register - Register new user');
console.log('POST /api/v1/auth/resend-verification - Resend verification email');
console.log('GET  /api/v1/auth/verify-email/:token - Verify email with token');
console.log('POST /api/v1/auth/login - Login user');

console.log('\n✨ Email Features:');
console.log('==================');
console.log('✅ Beautiful HTML email templates');
console.log('✅ Gmail SMTP integration');
console.log('✅ Resend verification functionality');
console.log('✅ 24-hour token expiration');
console.log('✅ Mobile-responsive design');
console.log('✅ Professional branding');

console.log('\n🎉 Setup complete! Follow the steps above to start sending real emails.');
