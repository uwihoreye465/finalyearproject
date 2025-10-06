const axios = require('axios');

async function testBlobUrlHandling() {
    try {
        console.log('🧪 Testing blob URL handling...');
        
        // Test 1: Send request with blob URL (should be ignored)
        console.log('\n📸 Test 1: Sending request with blob URL');
        const testData1 = {
            fullname: 'Test Criminal Blob',
            crime_type: 'Theft',
            date_arrested: '2025-01-06',
            arrest_location: 'Kigali',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '1234567890123456',
            image_url: 'blob:http://localhost:62706/8d1380ae-6e9b-40f1-898f-d03353668c7b'
        };
        
        const response1 = await axios.post('http://localhost:3000/api/v1/arrested/', testData1, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        
        console.log('✅ Response 1:', response1.data);
        console.log('📸 Image URL in response:', response1.data.data?.image_url);
        
        // Test 2: Send request with placeholder URL (should be ignored)
        console.log('\n📸 Test 2: Sending request with placeholder URL');
        const testData2 = {
            fullname: 'Test Criminal Placeholder',
            crime_type: 'Fraud',
            date_arrested: '2025-01-06',
            arrest_location: 'Kigali',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '1234567890123457',
            image_url: 'https://via.placeholder.com/300x200?text=Image+Upload+Failed'
        };
        
        const response2 = await axios.post('http://localhost:3000/api/v1/arrested/', testData2, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        
        console.log('✅ Response 2:', response2.data);
        console.log('📸 Image URL in response:', response2.data.data?.image_url);
        
        // Test 3: Send request without image (should be null)
        console.log('\n📸 Test 3: Sending request without image');
        const testData3 = {
            fullname: 'Test Criminal No Image',
            crime_type: 'Assault',
            date_arrested: '2025-01-06',
            arrest_location: 'Kigali',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '1234567890123458'
            // No image_url provided
        };
        
        const response3 = await axios.post('http://localhost:3000/api/v1/arrested/', testData3, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        
        console.log('✅ Response 3:', response3.data);
        console.log('📸 Image URL in response:', response3.data.data?.image_url);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testBlobUrlHandling();
