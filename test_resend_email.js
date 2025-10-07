const { Resend } = require('resend');

async function testResend() {
    console.log('🧪 Testing Resend Email Service...\n');

    try {
        // Initialize Resend with your API key
        const resend = new Resend('re_G6cQaYBW_BpZQH9SmgHiQrHoMzuHSnxAc');

        console.log('📧 Sending test email...');
        console.log('📧 To: uwihoreyefrancois12@gmail.com');
        console.log('📧 From: onboarding@resend.dev');
        console.log('📧 Subject: Test Email from Resend\n');

        // Send test email
        const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'uwihoreyefrancois12@gmail.com',
            subject: 'Test Email from Resend - Email Verification Fix',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">🎉 Resend Email Test</h1>
                        <p style="margin: 15px 0; font-size: 16px;">Online Tracking criminal System</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-bottom: 20px;">✅ Resend Email Service Working!</h2>
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Congratulations! Your Resend email service is now working perfectly. 
                            This means your email verification system will work on production.
                        </p>
                        
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <strong>✅ Success!</strong> Email sent via Resend API
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            <strong>Next Steps:</strong><br>
                            1. Add environment variables to Render<br>
                            2. Deploy your updated code<br>
                            3. Test user registration<br>
                            4. Check your email for verification links
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                        <p>This email was sent by Resend Email Service</p>
                        <p>Online Tracking criminal System</p>
                    </div>
                </div>
            `
        });

        console.log('✅ Email sent successfully!');
        console.log('📧 Message ID:', response.data.id);
        console.log('\n📧 CHECK YOUR EMAIL INBOX NOW!');
        console.log('📧 Look for email from: onboarding@resend.dev');
        console.log('📧 Subject: Test Email from Resend - Email Verification Fix');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Go to Render Dashboard → Environment');
        console.log('2. Add these environment variables:');
        console.log('   USE_RESEND=true');
        console.log('   RESEND_API_KEY=re_G6cQaYBW_BpZQH9SmgHiQrHoMzuHSnxAc');
        console.log('   RESEND_FROM_EMAIL=onboarding@resend.dev');
        console.log('   FRONTEND_URL=https://tracking-criminal.onrender.com');
        console.log('3. Deploy your changes');
        console.log('4. Test user registration');

    } catch (error) {
        console.error('❌ Resend test failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('1. Check your API key is correct');
        console.log('2. Make sure you have internet connection');
        console.log('3. Verify Resend account is active');
    }
}

testResend();
