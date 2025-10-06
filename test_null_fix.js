const axios = require('axios');

async function testNullFix() {
    try {
        console.log('🧪 Testing NULL fix for image_url...');
        
        // Test 1: Create record without image (should be null, not "NULL")
        console.log('\n📸 Test 1: Create record without image');
        const testData = {
            fullname: 'Test Criminal No Image',
            crime_type: 'Theft',
            date_arrested: '2025-01-06',
            arrest_location: 'Kigali',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '1234567890123456'
            // No image_url provided
        };
        
        const response = await axios.post('http://localhost:3000/api/v1/arrested/', testData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        
        console.log('✅ Response:', response.data);
        
        if (response.data.success && response.data.data) {
            const imageUrl = response.data.data.image_url;
            console.log('📸 Image URL value:', imageUrl);
            console.log('📸 Type:', typeof imageUrl);
            console.log('📸 Is null?', imageUrl === null);
            console.log('📸 Is "NULL"?', imageUrl === "NULL");
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testNullFix();
