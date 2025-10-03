const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env file for FindSinners System');
console.log('============================================');

const envContent = `# Database Configuration
DATABASE_URL=your-supabase-database-url-here

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

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists');
    console.log('📝 Backing up existing .env file to .env.backup');
    fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
}

fs.writeFileSync(envPath, envContent);
console.log('✅ .env file created successfully!');
console.log('\n📋 Next Steps:');
console.log('==============');
console.log('1. 🔐 Enable 2-Factor Authentication on your Gmail account');
console.log('2. 🔑 Generate an App Password for "FindSinners System"');
console.log('3. ⚙️  Update EMAIL_PASS in the .env file with your App Password');
console.log('4. 🗄️  Update DATABASE_URL with your Supabase database URL');
console.log('5. 🧪 Test with: node debug_email.js');
console.log('6. 🚀 Start server with: npm start');

console.log('\n📧 Gmail App Password Setup:');
console.log('============================');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Security → 2-Step Verification → Turn on');
console.log('3. Security → App passwords → Generate');
console.log('4. Select "Mail" and "Other (Custom name)"');
console.log('5. Enter "FindSinners System" as the name');
console.log('6. Copy the 16-character password');
console.log('7. Replace "your-gmail-app-password-here" in .env file');

console.log('\n🎯 Your .env file is ready! Edit it with your actual values.');
