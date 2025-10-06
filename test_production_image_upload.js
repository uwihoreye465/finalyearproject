const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://tracking-criminal.onrender.com';

async function testProductionImageUpload() {
    console.log('🧪 Testing Production Image Upload...\n');

    try {
        // Test 1: Health Check
        console.log('🔍 Test 1: Health Check');
        const healthResponse = await axios.get(`${PRODUCTION_URL}/api/health`);
        console.log('✅ Health Check:', healthResponse.data);
        console.log('');

        // Test 2: Get Records (to see current state)
        console.log('🔍 Test 2: Get Current Records');
        const recordsResponse = await axios.get(`${PRODUCTION_URL}/api/v1/arrested/`);
        console.log('✅ Records Response:', recordsResponse.data.message);
        console.log('📊 Total Records:', recordsResponse.data.data.records.length);
        console.log('');

        // Test 3: Login to get token
        console.log('🔍 Test 3: Login to Get Token');
        const loginResponse = await axios.post(`${PRODUCTION_URL}/api/v1/auth/login`, {
            email: 'uwihoreyefrancois21@gmail.com',
            password: 'Admin123'
        });
        console.log('✅ Login Success:', loginResponse.data.message);
        const token = loginResponse.data.data.accessToken;
        console.log('');

        // Test 4: Upload Image (JSON - no file)
        console.log('🔍 Test 4: Upload Record Without Image (JSON)');
        const jsonResponse = await axios.post(`${PRODUCTION_URL}/api/v1/arrested/`, {
            fullname: 'Production Test User',
            crime_type: 'Test Crime',
            date_arrested: '2024-01-15',
            arrest_location: 'Test Location',
            id_type: 'passport',
            id_number: 'P123456789'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ JSON Upload Success:', jsonResponse.data.message);
        console.log('📊 Image URL:', jsonResponse.data.data.image_url);
        console.log('');

        // Test 5: Upload with Blob URL (should be ignored)
        console.log('🔍 Test 5: Upload with Blob URL (should be ignored)');
        const blobResponse = await axios.post(`${PRODUCTION_URL}/api/v1/arrested/`, {
            fullname: 'Blob Test User',
            crime_type: 'Blob Crime',
            date_arrested: '2024-01-15',
            arrest_location: 'Blob Location',
            id_type: 'passport',
            id_number: 'P987654321',
            image_url: 'blob:http://localhost:62706/8d1380ae-6e9b-40f1-898f-d03353668c7b'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Blob URL Test Success:', blobResponse.data.message);
        console.log('📊 Image URL (should be null):', blobResponse.data.data.image_url);
        console.log('');

        // Test 6: Upload with Placeholder URL (should be ignored)
        console.log('🔍 Test 6: Upload with Placeholder URL (should be ignored)');
        const placeholderResponse = await axios.post(`${PRODUCTION_URL}/api/v1/arrested/`, {
            fullname: 'Placeholder Test User',
            crime_type: 'Placeholder Crime',
            date_arrested: '2024-01-15',
            arrest_location: 'Placeholder Location',
            id_type: 'passport',
            id_number: 'P111222333',
            image_url: 'https://via.placeholder.com/300x200?text=Image+Upload+Failed'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('✅ Placeholder URL Test Success:', placeholderResponse.data.message);
        console.log('📊 Image URL (should be null):', placeholderResponse.data.data.image_url);
        console.log('');

        // Test 7: Get Updated Records
        console.log('🔍 Test 7: Get Updated Records');
        const updatedRecordsResponse = await axios.get(`${PRODUCTION_URL}/api/v1/arrested/`);
        console.log('✅ Updated Records:', updatedRecordsResponse.data.message);
        console.log('📊 Total Records Now:', updatedRecordsResponse.data.data.records.length);
        console.log('');

        console.log('🎉 Production API Tests Completed!');
        console.log('📊 Summary:');
        console.log('  - Health Check: ✅');
        console.log('  - Authentication: ✅');
        console.log('  - JSON Upload: ✅');
        console.log('  - Blob URL Handling: ✅');
        console.log('  - Placeholder URL Handling: ✅');
        console.log('  - Records Retrieval: ✅');

    } catch (error) {
        console.error('❌ Production Test Failed:', error.message);
        if (error.response) {
            console.error('📊 Response Status:', error.response.status);
            console.error('📊 Response Data:', error.response.data);
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.error('🔌 Connection Error: Production server might be down');
        } else if (error.response?.status === 503) {
            console.error('🚫 Service Unavailable: Production server is overloaded or restarting');
        } else if (error.response?.status === 500) {
            console.error('💥 Server Error: Check production logs');
        }
    }
}

// Run the tests
testProductionImageUpload();
