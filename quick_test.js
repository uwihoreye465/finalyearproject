const axios = require('axios');

async function testRegistration() {
    console.log('🧪 Testing Registration API...');
    console.log('📧 Email: uwihoreyefrancois12@gmail.com');
    
    try {
        const response = await axios.post('http://localhost:6000/api/v1/auth/register', {
            sector: 'Kigali',
            fullname: 'Test User Email Verification',
            position: 'Police Officer',
            email: 'uwihoreyefrancois12@gmail.com',
            password: 'TestPassword123!',
            role: 'staff'
        });
        
        console.log('✅ Registration Success!');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        console.log('\n📧 Check your Gmail inbox for verification email!');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        
    } catch (error) {
        console.log('❌ Registration Error:');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        console.log('📊 Full Error:', error.message);
    }
}

testRegistration();
