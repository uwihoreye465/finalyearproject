const fs = require('fs');
const path = require('path');

console.log('🚀 FindSinners System - Gmail Email Verification Setup');
console.log('=======================================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');

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

console.log('\n📋 Gmail Setup Instructions:');
console.log('============================');
console.log('1. 🔐 Go to: https://myaccount.google.com/');
console.log('2. 🔐 Security → 2-Step Verification → Turn on');
console.log('3. 🔑 Security → App passwords → Generate');
console.log('4. 🔑 Select "Mail" and "Other (Custom name)"');
console.log('5. 🔑 Enter "FindSinners System" as the name');
console.log('6. 🔑 Copy the 16-character password');
console.log('7. ⚙️  Replace "your-gmail-app-password-here" in .env file');

console.log('\n🧪 Testing Commands:');
console.log('====================');
console.log('1. Test Gmail config: node debug_email.js');
console.log('2. Start server: npm start');
console.log('3. Test registration: curl -X POST http://localhost:6000/api/v1/auth/register \\');
console.log('   -H "Content-Type: application/json" \\');
console.log('   -d \'{"sector":"Kigali","fullname":"Test User","position":"Police Officer","email":"uwihoreyefrancois12@gmail.com","password":"TestPassword123!","role":"staff"}\'');

console.log('\n📧 Email Verification Flow:');
console.log('============================');
console.log('1. User registers → Verification email sent');
console.log('2. User clicks email link → Account verified');
console.log('3. User can now login → Login only works for verified users');

console.log('\n🎯 Your email verification system is ready!');
console.log('Follow the Gmail setup instructions above to start sending real emails.');
