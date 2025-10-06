const axios = require('axios');

async function checkAccountStatus() {
    console.log('🔍 Checking Account Status');
    console.log('==========================');
    
    try {
        console.log('🔐 Testing login to check verification status...');
        const response = await axios.post('http://localhost:6000/api/v1/auth/login', {
            email: 'uwihoreyefrancois12@gmail.com',
            password: 'TestPassword123!'
        });
        
        console.log('✅ Login successful!');
        console.log('📊 Status:', response.status);
        console.log('📊 Response:', response.data);
        
        console.log('\n🎉 Your account is already verified and working!');
        console.log('🔐 You can now login successfully');
        
    } catch (error) {
        console.log('❌ Login failed');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        
        if (error.response?.data?.message === 'Please verify your email before logging in') {
            console.log('\n💡 Your email is not verified yet');
            console.log('📧 Check your Gmail for verification email');
            console.log('🌐 Use Edge or Firefox to open the verification link');
        }
    }
}

checkAccountStatus();
