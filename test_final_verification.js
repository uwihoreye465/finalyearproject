const axios = require('axios');

async function testHTMLVerification() {
    try {
        console.log('🧪 Testing HTML Verification System');
        console.log('==================================');
        
        // Test registration
        console.log('📝 Registering new test user...');
        const registerData = {
            sector: 'test',
            fullname: 'HTML Test User',
            position: 'Tester',
            email: 'htmltest@example.com',
            password: 'TestPassword123!'
        };
        
        const response = await axios.post('http://localhost:6000/api/v1/auth/register', registerData);
        
        if (response.data.success) {
            console.log('✅ Registration successful!');
            console.log('📧 Check your email for verification link');
            console.log('🔗 The email should now redirect to: http://localhost:6000/my_account.html');
            console.log('🎯 This will solve the Chrome ERR_UNSAFE_PORT issue!');
        } else {
            console.log('❌ Registration failed:', response.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.message || error.message);
    }
}

testHTMLVerification();
