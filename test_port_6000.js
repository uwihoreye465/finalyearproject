const axios = require('axios');

async function testPort6000() {
    try {
        console.log('🧪 Testing server on port 6000...');
        
        // Test health endpoint
        const healthResponse = await axios.get('http://localhost:6000/api/health');
        console.log('✅ Health check:', healthResponse.data);
        
        // Test arrested records endpoint
        const arrestedResponse = await axios.get('http://localhost:6000/api/v1/arrested/');
        console.log('✅ Arrested records:', arrestedResponse.data.message);
        console.log('📊 Total records:', arrestedResponse.data.data.records.length);
        
        // Test statistics endpoint
        const statsResponse = await axios.get('http://localhost:6000/api/v1/arrested/statistics');
        console.log('✅ Statistics:', statsResponse.data.message);
        
        console.log('🎉 Server is working perfectly on port 6000!');
        
    } catch (error) {
        console.error('❌ Error testing port 6000:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testPort6000();
