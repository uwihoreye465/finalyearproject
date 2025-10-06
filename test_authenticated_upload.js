const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function getAuthToken() {
    try {
        console.log('🔐 Getting authentication token...');
        
        // First, let's try to register a test user
        const registerResponse = await axios.post(`${BASE_URL}/api/v1/auth/register`, {
            fullname: 'Test User',
            email: 'test@example.com',
            password: 'Test123!',
            sector: 'Kigali',
            position: 'Officer',
            role: 'staff'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ User registered:', registerResponse.data.message);
        
        // Now login to get token
        const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
            email: 'test@example.com',
            password: 'Test123!'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Login successful');
        return loginResponse.data.data.accessToken;
        
    } catch (error) {
        if (error.response && error.response.status === 409) {
            // User already exists, try to login
            console.log('👤 User already exists, logging in...');
            try {
                const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
                    email: 'test@example.com',
                    password: 'Test123!'
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                console.log('✅ Login successful');
                return loginResponse.data.data.accessToken;
            } catch (loginError) {
                console.error('❌ Login failed:', loginError.response?.data?.message || loginError.message);
                throw loginError;
            }
        } else {
            console.error('❌ Registration failed:', error.response?.data?.message || error.message);
            throw error;
        }
    }
}

async function testImageUpload() {
    console.log('🧪 Testing Image Upload with Authentication...\n');

    try {
        // Get authentication token
        const token = await getAuthToken();
        console.log('🔑 Token obtained successfully\n');

        // Test 1: Upload with actual image file
        console.log('📸 Test 1: Upload with image file');
        const formData = new FormData();
        formData.append('fullname', 'John Doe');
        formData.append('crime_type', 'Theft');
        formData.append('date_arrested', '2024-01-15');
        formData.append('arrest_location', 'Kigali, Rwanda');
        formData.append('id_type', 'indangamuntu_yumunyarwanda');
        formData.append('id_number', '1234567890123456');
        
        // Create a dummy image file for testing
        const testImagePath = path.join(__dirname, 'test-image.jpg');
        if (!fs.existsSync(testImagePath)) {
            // Create a simple test file
            fs.writeFileSync(testImagePath, 'fake image data for testing');
        }
        
        formData.append('image', fs.createReadStream(testImagePath));

        const response1 = await axios.post(`${BASE_URL}/api/v1/arrested/`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            },
        });

        console.log('✅ Test 1 Success:', response1.data.message);
        console.log('📊 Image URL:', response1.data.data.image_url);
        console.log('');

        // Test 2: Upload without image (JSON)
        console.log('📝 Test 2: Upload without image (JSON)');
        const response2 = await axios.post(`${BASE_URL}/api/v1/arrested/`, {
            fullname: 'Jane Smith',
            crime_type: 'Fraud',
            date_arrested: '2024-01-16',
            arrest_location: 'Huye, Rwanda',
            id_type: 'passport',
            id_number: 'P123456789'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Test 2 Success:', response2.data.message);
        console.log('📊 Image URL:', response2.data.data.image_url);
        console.log('');

        // Test 3: Upload with blob URL
        console.log('🔗 Test 3: Upload with blob URL');
        const response3 = await axios.post(`${BASE_URL}/api/v1/arrested/`, {
            fullname: 'Bob Wilson',
            crime_type: 'Assault',
            date_arrested: '2024-01-17',
            arrest_location: 'Musanze, Rwanda',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '9876543210987654',
            image_url: 'blob:http://localhost:62706/8d1380ae-6e9b-40f1-898f-d03353668c7b'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Test 3 Success:', response3.data.message);
        console.log('📊 Image URL:', response3.data.data.image_url);
        console.log('');

        // Test 4: Upload with placeholder URL
        console.log('🖼️ Test 4: Upload with placeholder URL');
        const response4 = await axios.post(`${BASE_URL}/api/v1/arrested/`, {
            fullname: 'Alice Johnson',
            crime_type: 'Robbery',
            date_arrested: '2024-01-18',
            arrest_location: 'Rubavu, Rwanda',
            id_type: 'indangamuntu_yumunyarwanda',
            id_number: '1111222233334444',
            image_url: 'https://via.placeholder.com/300x200?text=Image+Upload+Failed'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('✅ Test 4 Success:', response4.data.message);
        console.log('📊 Image URL:', response4.data.data.image_url);
        console.log('');

        // Test 5: Missing required fields
        console.log('❌ Test 5: Missing required fields');
        try {
            await axios.post(`${BASE_URL}/api/v1/arrested/`, {
                crime_type: 'Theft'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.log('✅ Test 5 Success (Expected Error):', error.response.data.message);
        }
        console.log('');

        // Test 6: Invalid ID type
        console.log('❌ Test 6: Invalid ID type');
        try {
            await axios.post(`${BASE_URL}/api/v1/arrested/`, {
                fullname: 'Test User',
                crime_type: 'Theft',
                id_type: 'invalid_type'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.log('✅ Test 6 Success (Expected Error):', error.response.data.message);
        }
        console.log('');

        console.log('🎉 All tests completed! Check your server console for detailed logs.');
        console.log('📁 Check the uploads/arrested/images/ directory for uploaded files.');
        console.log('🗄️ Check your database to verify image_url values.');

        // Clean up test file
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
            console.log('🧹 Cleaned up test image file.');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the tests
testImageUpload();
