const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testImageUpload() {
    try {
        console.log('🧪 Testing image upload fix...');
        
        // Test 1: Upload with actual image file
        console.log('\n📸 Test 1: Upload with actual image file');
        const formData = new FormData();
        formData.append('fullname', 'Test Criminal');
        formData.append('crime_type', 'Theft');
        formData.append('date_arrested', '2025-01-06');
        formData.append('arrest_location', 'Kigali');
        formData.append('id_type', 'indangamuntu_yumunyarwanda');
        formData.append('id_number', '1234567890123456');
        
        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        formData.append('image', testImageBuffer, {
            filename: 'test.png',
            contentType: 'image/png'
        });
        
        const response1 = await axios.post('http://localhost:3000/api/v1/arrested/', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        
        console.log('✅ Response 1:', response1.data);
        
        // Test 2: Upload with placeholder URL (should be ignored)
        console.log('\n📸 Test 2: Upload with placeholder URL (should be ignored)');
        const testData2 = {
            fullname: 'Test Criminal 2',
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
        
        // Test 3: Upload without image (should work fine)
        console.log('\n📸 Test 3: Upload without image (should work fine)');
        const testData3 = {
            fullname: 'Test Criminal 3',
            crime_type: 'Assault',
            date_arrested: '2025-01-06',
            arrest_location: 'Kigali',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '1234567890123458'
        };
        
        const response3 = await axios.post('http://localhost:3000/api/v1/arrested/', testData3, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        
        console.log('✅ Response 3:', response3.data);
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testImageUpload();
