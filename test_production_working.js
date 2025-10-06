const axios = require('axios');

async function testProductionRegistration() {
    try {
        console.log('🧪 Testing production API registration with new user...');
        
        // Generate a unique email for testing
        const timestamp = Date.now();
        const testUser = {
            fullname: 'Production Test User',
            email: `test${timestamp}@example.com`,
            password: 'Test123!@#',
            sector: 'test',
            position: 'tester'
        };

        console.log('📧 Registering user:', testUser.email);
        const response = await axios.post('https://tracking-criminal.onrender.com/api/v1/auth/register', testUser);
        
        console.log('✅ Registration successful!');
        console.log('Response:', response.data);
        
        if (response.data.success) {
            console.log('📧 Check your email for verification link!');
            console.log('🔗 The email should redirect to: https://tracking-criminal.onrender.com/my_account.html?token=[TOKEN]');
        }
        
    } catch (error) {
        console.error('❌ Error details:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testProductionRegistration();
