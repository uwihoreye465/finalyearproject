const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Debugging Email Configuration');
console.log('================================');

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '587');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'http://localhost:6000');

if (!process.env.EMAIL_PASS) {
    console.log('\n❌ EMAIL_PASS is not set!');
    console.log('Please set EMAIL_PASS in your .env file with your Gmail App Password');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com',
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Test connection
async function testConnection() {
    console.log('\n🔌 Testing SMTP Connection...');
    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        return true;
    } catch (error) {
        console.log('❌ SMTP connection failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Make sure 2-factor authentication is enabled on your Gmail account');
        console.log('2. Generate an App Password for "FindSinners System"');
        console.log('3. Use the App Password (not your regular Gmail password)');
        console.log('4. Check that EMAIL_PASS is set correctly in your .env file');
        return false;
    }
}

// Test sending email
async function testSendEmail() {
    console.log('\n📧 Testing Email Send...');
    
    const testToken = 'test-token-' + Math.random().toString(36).substring(7);
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:6000'}/api/v1/auth/verify-email/${testToken}`;
    
    const mailOptions = {
        from: `"FindSinners System" <${process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com'}>`,
        to: process.env.EMAIL_USER || 'uwihoreyefrancois12@gmail.com', // Send to yourself for testing
        subject: '🧪 Test Email - FindSinners System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1>🧪 Test Email</h1>
                <p>This is a test email from FindSinners System.</p>
                <p><strong>Test Token:</strong> ${testToken}</p>
                <p><strong>Verification URL:</strong> <a href="${verifyUrl}">${verifyUrl}</a></p>
                <p>If you receive this email, your SMTP configuration is working correctly!</p>
            </div>
        `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Check your inbox for the test email');
        return true;
    } catch (error) {
        console.log('❌ Failed to send test email:', error.message);
        console.log('Full error:', error);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('\n🚀 Starting email tests...');
    
    const connectionOk = await testConnection();
    if (!connectionOk) {
        console.log('\n❌ Cannot proceed with email test - connection failed');
        return;
    }
    
    const emailOk = await testSendEmail();
    if (emailOk) {
        console.log('\n🎉 Email system is working correctly!');
        console.log('You should receive a test email in your inbox shortly.');
    } else {
        console.log('\n❌ Email sending failed. Check the error messages above.');
    }
}

// Run tests
runTests().catch(console.error);
