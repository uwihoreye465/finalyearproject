const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1/arrested';
const TEST_IMAGE_PATH = path.join(__dirname, 'test_image.jpg');

// Create a simple test image if it doesn't exist
function createTestImage() {
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
        // Create a simple 1x1 pixel JPEG image
        const testImageBuffer = Buffer.from([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
            0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
            0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
            0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
            0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
            0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
            0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x00, 0xFF, 0xD9
        ]);
        fs.writeFileSync(TEST_IMAGE_PATH, testImageBuffer);
        console.log('✅ Created test image:', TEST_IMAGE_PATH);
    }
}

// Test 1: Create arrested record with image upload
async function testCreateWithImage() {
    console.log('\n🧪 Test 1: Creating arrested record with image upload...');
    
    try {
        const formData = new FormData();
        formData.append('fullname', 'John Doe Test');
        formData.append('crime_type', 'Theft');
        formData.append('date_arrested', '2024-01-15');
        formData.append('arrest_location', 'Kigali, Rwanda');
        formData.append('id_type', 'indangamuntu_yumunyarwanda');
        formData.append('id_number', '1234567890123456');
        formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

        const response = await axios.post(BASE_URL, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': 'Bearer your-test-token-here' // Replace with actual token
            }
        });

        console.log('✅ Response:', response.data);
        
        if (response.data.success && response.data.data.image_url) {
            console.log('✅ Image URL saved:', response.data.data.image_url);
            return response.data.data.arrest_id;
        } else {
            console.log('❌ Image URL not saved properly');
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        return null;
    }
}

// Test 2: Create arrested record without image (JSON)
async function testCreateWithoutImage() {
    console.log('\n🧪 Test 2: Creating arrested record without image (JSON)...');
    
    try {
        const data = {
            fullname: 'Jane Smith Test',
            crime_type: 'Fraud',
            date_arrested: '2024-01-16',
            arrest_location: 'Huye, Rwanda',
            id_type: 'passport',
            id_number: 'P123456789'
        };

        const response = await axios.post(BASE_URL, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-test-token-here' // Replace with actual token
            }
        });

        console.log('✅ Response:', response.data);
        return response.data.data.arrest_id;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        return null;
    }
}

// Test 3: Update arrested record with image
async function testUpdateWithImage(arrestId) {
    console.log('\n🧪 Test 3: Updating arrested record with image...');
    
    try {
        const formData = new FormData();
        formData.append('fullname', 'John Doe Updated');
        formData.append('crime_type', 'Robbery');
        formData.append('image', fs.createReadStream(TEST_IMAGE_PATH));

        const response = await axios.put(`${BASE_URL}/${arrestId}`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': 'Bearer your-test-token-here' // Replace with actual token
            }
        });

        console.log('✅ Response:', response.data);
        
        if (response.data.success && response.data.data.image_url) {
            console.log('✅ Image URL updated:', response.data.data.image_url);
        } else {
            console.log('❌ Image URL not updated properly');
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 4: Get arrested record and verify image URL
async function testGetArrested(arrestId) {
    console.log('\n🧪 Test 4: Getting arrested record to verify image URL...');
    
    try {
        const response = await axios.get(`${BASE_URL}/${arrestId}`);
        
        console.log('✅ Response:', response.data);
        
        if (response.data.success && response.data.data.image_url) {
            console.log('✅ Image URL found:', response.data.data.image_url);
            
            // Check if image file exists
            const filename = response.data.data.image_url.replace('/uploads/arrested/images/', '');
            const filePath = path.join(__dirname, 'uploads', 'arrested', 'images', filename);
            
            if (fs.existsSync(filePath)) {
                console.log('✅ Image file exists on disk:', filePath);
            } else {
                console.log('❌ Image file not found on disk:', filePath);
            }
        } else {
            console.log('❌ No image URL found');
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 5: Download image
async function testDownloadImage(arrestId) {
    console.log('\n🧪 Test 5: Testing image download...');
    
    try {
        const response = await axios.get(`${BASE_URL}/${arrestId}/download/image`, {
            responseType: 'stream'
        });
        
        console.log('✅ Image download successful');
        console.log('✅ Content-Type:', response.headers['content-type']);
        console.log('✅ Content-Length:', response.headers['content-length']);
        
        // Save downloaded image for verification
        const downloadPath = path.join(__dirname, 'downloaded_test_image.jpg');
        const writer = fs.createWriteStream(downloadPath);
        response.data.pipe(writer);
        
        writer.on('finish', () => {
            console.log('✅ Downloaded image saved to:', downloadPath);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting arrested image upload tests...');
    
    // Create test image
    createTestImage();
    
    // Run tests
    const arrestId1 = await testCreateWithImage();
    const arrestId2 = await testCreateWithoutImage();
    
    if (arrestId1) {
        await testUpdateWithImage(arrestId1);
        await testGetArrested(arrestId1);
        await testDownloadImage(arrestId1);
    }
    
    if (arrestId2) {
        await testGetArrested(arrestId2);
    }
    
    console.log('\n🏁 Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testCreateWithImage,
    testCreateWithoutImage,
    testUpdateWithImage,
    testGetArrested,
    testDownloadImage,
    runTests
};
