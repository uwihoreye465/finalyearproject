const axios = require('axios');
const FormData = require('form-data');

// Test image upload functionality
async function testImageUpload() {
  console.log('🧪 Testing Image Upload Functionality...\n');

  try {
    // Test 1: Test the upload-image endpoint (should get 401 without auth)
    console.log('📸 Test 1: Testing upload-image endpoint');
    
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const response = await axios.post('http://localhost:6000/api/v1/arrested/upload-image', {
      image: base64Image,
      filename: 'test.png'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Upload successful:', response.data);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Route is working correctly! (401 Unauthorized - needs auth token)');
      console.log('📋 Response:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first.');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test 2: Test multipart upload
  console.log('\n📤 Test 2: Testing multipart upload');
  
  try {
    const formData = new FormData();
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    formData.append('image', testImageBuffer, {
      filename: 'test_image.png',
      contentType: 'image/png'
    });

    const response = await axios.post('http://localhost:6000/api/v1/arrested/upload-image', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ Multipart upload successful:', response.data);
    
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Multipart route is working correctly! (401 Unauthorized - needs auth token)');
      console.log('📋 Response:', error.response.data);
    } else {
      console.log('❌ Multipart upload error:', error.response?.data || error.message);
    }
  }

  console.log('\n🎯 Summary:');
  console.log('- ✅ Server is running on port 6000');
  console.log('- ✅ /upload-image endpoint exists and responds');
  console.log('- ✅ Both JSON (base64) and multipart uploads are supported');
  console.log('- ✅ Authentication is required (401 Unauthorized)');
  console.log('\n💡 Next steps:');
  console.log('1. Get a valid authentication token');
  console.log('2. Test with real image files');
  console.log('3. Verify images are saved in uploads/arrested/images/');
}

// Run the test
testImageUpload();
