const axios = require('axios');

async function testLoginAfterFix() {
    console.log('🔐 Testing Login After Database Fix');
    console.log('==================================');
    
    try {
        console.log('🔄 Attempting to login...');
        const response = await axios.post('http://localhost:6000/api/v1/auth/login', {
            email: 'uwihoreyefrancois12@gmail.com',
            password: 'TestPassword123!'
        });
        
        console.log('✅ Login successful!');
        console.log('📊 Status:', response.status);
        console.log('📊 Response:', response.data);
        
        console.log('\n🎉 Your account is now fully functional!');
        console.log('🔐 You can login and use the system');
        
    } catch (error) {
        console.log('❌ Login failed');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        
        if (error.response?.data?.message === 'Invalid credentials') {
            console.log('\n💡 Password might be incorrect');
            console.log('🔑 Try with the password you used during registration');
        }
    }
}

testLoginAfterFix();
