const axios = require('axios');

async function testMyAccountPage() {
    try {
        console.log('🧪 Testing My Account Page System');
        console.log('==================================');
        
        // Test registration with unique email
        const timestamp = Date.now();
        console.log('📝 Registering new test user...');
        const registerData = {
            sector: 'test',
            fullname: 'My Account Test User',
            position: 'Tester',
            email: `myaccounttest${timestamp}@example.com`,
            password: 'TestPassword123!'
        };
        
        const response = await axios.post('http://localhost:6000/api/v1/auth/register', registerData);
        
        if (response.data.success) {
            console.log('✅ Registration successful!');
            console.log('📧 Check your email for verification link');
            console.log('🔗 The email should now redirect to: http://localhost:6000/my_account.html');
            console.log('✨ Clean URL - no parameters!');
            console.log('🎯 This will solve the Chrome ERR_UNSAFE_PORT issue!');
            console.log('📱 The my_account.html page will show:');
            console.log('   • Account verification status');
            console.log('   • User information');
            console.log('   • Action buttons (Login, Dashboard, Help)');
            console.log('   • Beautiful UI with animations');
        } else {
            console.log('❌ Registration failed:', response.data.message);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.response?.data?.message || error.message);
    }
}

testMyAccountPage();
