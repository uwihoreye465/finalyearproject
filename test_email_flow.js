const axios = require('axios');

async function testEmailVerificationFlow() {
    console.log('📧 Testing Email Verification Flow');
    console.log('==================================');
    
    try {
        // Send a new verification email to get fresh token
        console.log('🔄 Sending new verification email...');
        const resendResponse = await axios.post('http://localhost:6000/api/v1/auth/resend-verification', {
            email: 'uwihoreyefrancois12@gmail.com'
        });
        
        console.log('✅ Verification email sent!');
        console.log('📊 Response:', resendResponse.data);
        
        console.log('\n📧 Check your Gmail inbox for the verification email');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        
        console.log('\n🔗 The verification URL in the email will be:');
        console.log('http://localhost:6000/api/v1/auth/verify-email/[TOKEN]');
        
        console.log('\n❌ Problem: Chrome blocks port 6000 (ERR_UNSAFE_PORT)');
        console.log('✅ Solutions:');
        console.log('1. Use Microsoft Edge or Firefox');
        console.log('2. Start Chrome with unsafe ports enabled');
        console.log('3. Create a verification page that works in Chrome');
        
    } catch (error) {
        console.log('❌ Failed to send verification email');
        console.log('📊 Error:', error.response?.data?.message);
    }
}

testEmailVerificationFlow();
