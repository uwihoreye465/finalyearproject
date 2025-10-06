const axios = require('axios');

async function testProductionEmail() {
    try {
        console.log('🧪 Testing email verification with production API...');
        
        const testUser = {
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'Test123!@#',
            sector: 'test',
            position: 'tester'
        };

        console.log('📧 Registering test user...');
        const response = await axios.post('https://tracking-criminal.onrender.com/api/v1/auth/register', testUser);
        
        console.log('✅ Registration response:', response.data);
        
        if (response.data.success) {
            console.log('📧 Check your email for verification link!');
            console.log('🔗 The email should now redirect to: https://tracking-criminal.onrender.com/my_account.html?token=[TOKEN]');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testProductionEmail();
