const axios = require('axios');

async function testResendVerification() {
    console.log('🔄 Testing Resend Verification API...');
    console.log('📧 Email: uwihoreyefrancois12@gmail.com');
    
    try {
        const response = await axios.post('http://localhost:6000/api/v1/auth/resend-verification', {
            email: 'uwihoreyefrancois12@gmail.com'
        });
        
        console.log('✅ Resend Verification Success!');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        console.log('\n📧 Check your Gmail inbox for NEW verification email!');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        
    } catch (error) {
        console.log('❌ Resend Verification Error:');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        console.log('📊 Full Error:', error.message);
    }
}

testResendVerification();
