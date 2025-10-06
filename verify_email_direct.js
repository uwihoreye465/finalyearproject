const axios = require('axios');

async function verifyEmailDirectly() {
    console.log('🔐 Direct Email Verification');
    console.log('============================');
    
    const token = '8a5cf11493c738532dbf5df4801536308505d9bdf874eb196712e42e7b3d7cd2';
    
    console.log('🎫 Verification Token:', token);
    console.log('🌐 API URL: http://localhost:6000/api/v1/auth/verify-email/' + token);
    
    try {
        console.log('\n🔄 Verifying email...');
        const response = await axios.get(`http://localhost:6000/api/v1/auth/verify-email/${token}`);
        
        console.log('✅ Email verification successful!');
        console.log('📊 Status:', response.status);
        console.log('📊 Response:', response.data);
        
        console.log('\n🎉 Your account is now verified!');
        console.log('🔐 You can now login to your account');
        
        // Test login after verification
        console.log('\n🧪 Testing login after verification...');
        try {
            const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                email: 'uwihoreyefrancois12@gmail.com',
                password: 'TestPassword123!'
            });
            
            console.log('✅ Login successful after verification!');
            console.log('📊 Login Response:', loginResponse.data);
            
        } catch (loginError) {
            console.log('❌ Login failed:', loginError.response?.data?.message);
        }
        
    } catch (error) {
        console.log('❌ Email verification failed');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        console.log('📊 Full Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure your server is running:');
            console.log('   npm start');
        }
    }
}

verifyEmailDirectly();
