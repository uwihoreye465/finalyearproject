const axios = require('axios');

async function sendNewVerificationEmail() {
    console.log('📧 Sending New Verification Email');
    console.log('==================================');
    
    try {
        console.log('🔄 Sending resend verification email...');
        const response = await axios.post('http://localhost:6000/api/v1/auth/resend-verification', {
            email: 'uwihoreyefrancois12@gmail.com'
        });
        
        console.log('✅ New verification email sent!');
        console.log('📊 Status:', response.status);
        console.log('📊 Response:', response.data);
        
        console.log('\n📧 Check your Gmail inbox for NEW verification email!');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        console.log('\n💡 To verify your email:');
        console.log('1. Open the email in Gmail');
        console.log('2. Copy the verification token from the URL');
        console.log('3. Use Microsoft Edge or Firefox to open the verification link');
        console.log('4. Or run: node verify_email_direct.js');
        
    } catch (error) {
        console.log('❌ Failed to send verification email');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
    }
}

sendNewVerificationEmail();
