const axios = require('axios');

async function testProductionAPI() {
    try {
        console.log('🧪 Testing production API...');
        
        // First, let's test if the API is reachable
        console.log('📡 Testing API health...');
        try {
            const healthResponse = await axios.get('https://tracking-criminal.onrender.com/api/health');
            console.log('✅ Health check:', healthResponse.data);
        } catch (healthError) {
            console.log('❌ Health check failed:', healthError.message);
        }
        
        // Test registration
        console.log('📧 Testing registration...');
        const testUser = {
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'Test123!@#',
            sector: 'test',
            position: 'tester'
        };

        const response = await axios.post('https://tracking-criminal.onrender.com/api/v1/auth/register', testUser);
        console.log('✅ Registration response:', response.data);
        
    } catch (error) {
        console.error('❌ Error details:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testProductionAPI();
