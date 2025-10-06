const axios = require('axios');

async function testNewPort() {
    console.log('🧪 Testing Server on Port 3000...');
    
    try {
        const response = await axios.get('http://localhost:3000/api/health');
        console.log('✅ Server is running on port 3000!');
        console.log('📊 Response:', response.data);
        
        // Test resend verification with new port
        console.log('\n🔄 Testing Resend Verification on Port 3000...');
        const resendResponse = await axios.post('http://localhost:3000/api/v1/auth/resend-verification', {
            email: 'uwihoreyefrancois12@gmail.com'
        });
        
        console.log('✅ Resend Verification Success!');
        console.log('📊 Response:', resendResponse.data);
        
        console.log('\n📧 Check your Gmail for NEW verification email!');
        console.log('🔗 New verification link will use port 3000');
        console.log('✅ This should work in Chrome without ERR_UNSAFE_PORT error');
        
    } catch (error) {
        console.log('❌ Server not running on port 3000');
        console.log('📊 Error:', error.message);
        console.log('\n💡 Start your server with: npm start');
    }
}

testNewPort();
