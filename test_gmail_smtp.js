const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Testing Gmail SMTP Configuration');
console.log('====================================');

// Test Gmail SMTP configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'uwihoreyefrancois12@gmail.com',
        pass: process.env.EMAIL_PASS || 'YOUR_GMAIL_APP_PASSWORD_HERE'
    },
    tls: {
        rejectUnauthorized: false
    }
});

async function testGmailConnection() {
    console.log('\n📧 Testing Gmail SMTP Connection...');
    console.log('📧 Email:', 'uwihoreyefrancois12@gmail.com');
    console.log('🔑 App Password:', process.env.EMAIL_PASS ? '***SET***' : '❌ NOT SET');
    
    try {
        // Test connection
        console.log('\n🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ Gmail SMTP connection verified successfully!');
        
        // Send test email
        console.log('\n📧 Sending test verification email...');
        const testToken = 'test123456789abcdef';
        const verificationUrl = `http://localhost:6000/api/v1/auth/verify-email/${testToken}`;
        
        const mailOptions = {
            from: 'uwihoreyefrancois12@gmail.com',
            to: 'uwihoreyefrancois12@gmail.com',
            subject: '🔐 Test Verification Email - FindSinners System',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .button:hover { background: #45a049; }
                        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 Test Email Verification</h1>
                            <p>FindSinners System</p>
                        </div>
                        <div class="content">
                            <h2>Hello Test User!</h2>
                            <p>This is a test verification email to check if Gmail SMTP is working correctly.</p>
                            <p>Click the button below to verify your email address:</p>
                            <a href="${verificationUrl}" class="button">✅ Verify My Email</a>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
                            <p><strong>Verification Token:</strong> ${testToken}</p>
                            <p>If you didn't request this verification, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is a test email from FindSinners System</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Check your Gmail inbox');
        console.log('2. Look for email with subject: "🔐 Test Verification Email - FindSinners System"');
        console.log('3. Check spam/junk folder if not in inbox');
        console.log('4. Click the verification button in the email');
        
    } catch (error) {
        console.error('❌ Gmail SMTP test failed:', error.message);
        console.error('❌ Full error:', error);
        
        console.log('\n💡 Troubleshooting Steps:');
        console.log('1. Make sure you have enabled 2-factor authentication on Gmail');
        console.log('2. Generate an App Password:');
        console.log('   - Go to: https://myaccount.google.com/');
        console.log('   - Security → 2-Step Verification → Turn on');
        console.log('   - Security → App passwords → Generate');
        console.log('   - Select "Mail" and "Other (Custom name)"');
        console.log('   - Enter "FindSinners System" as the name');
        console.log('   - Copy the 16-character password');
        console.log('3. Set the App Password in your environment:');
        console.log('   - Create a .env file in your project root');
        console.log('   - Add: EMAIL_PASS=your_16_character_app_password');
        console.log('4. Restart your server after setting EMAIL_PASS');
    }
}

// Run the test
testGmailConnection().catch(console.error);
