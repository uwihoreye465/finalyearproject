const axios = require('axios');

const PRODUCTION_URL = 'https://tracking-criminal.onrender.com';

async function testProductionEmailVerification() {
    console.log('🧪 Testing Production Email Verification...\n');

    try {
        // Test 1: Health Check
        console.log('🔍 Test 1: Health Check');
        const healthResponse = await axios.get(`${PRODUCTION_URL}/api/health`);
        console.log('✅ Health Check:', healthResponse.data.message);
        console.log('');

        // Test 2: Register a new user (this should send verification email)
        console.log('🔍 Test 2: Register New User (Should Send Verification Email)');
        const testEmail = `test-${Date.now()}@example.com`;
        const testUser = {
            fullname: 'Test User Production',
            email: testEmail,
            password: 'Test123!',
            sector: 'Kigali',
            position: 'Officer',
            role: 'staff'
        };

        console.log('📧 Registering user:', testUser.email);
        
        try {
            const registerResponse = await axios.post(`${PRODUCTION_URL}/api/v1/auth/register`, testUser);
            console.log('✅ Registration Response:', registerResponse.data.message);
            console.log('📊 User ID:', registerResponse.data.data?.userId);
            console.log('📊 Verification Required:', registerResponse.data.data?.requiresVerification);
            console.log('');
        } catch (registerError) {
            if (registerError.response?.status === 409) {
                console.log('⚠️ User already exists, trying to login instead...');
                
                // Try to login to see if user exists
                try {
                    const loginResponse = await axios.post(`${PRODUCTION_URL}/api/v1/auth/login`, {
                        email: testEmail,
                        password: 'Test123!'
                    });
                    console.log('✅ Login Response:', loginResponse.data.message);
                    console.log('📊 User Status:', loginResponse.data.data?.role);
                } catch (loginError) {
                    console.log('❌ Login Failed:', loginError.response?.data?.message);
                }
            } else {
                console.log('❌ Registration Failed:', registerError.response?.data?.message);
            }
        }

        // Test 3: Test with a different email
        console.log('🔍 Test 3: Register with Different Email');
        const testEmail2 = `test2-${Date.now()}@example.com`;
        const testUser2 = {
            fullname: 'Test User 2 Production',
            email: testEmail2,
            password: 'Test123!',
            sector: 'Huye',
            position: 'Officer',
            role: 'staff'
        };

        console.log('📧 Registering user:', testUser2.email);
        
        try {
            const registerResponse2 = await axios.post(`${PRODUCTION_URL}/api/v1/auth/register`, testUser2);
            console.log('✅ Registration Response:', registerResponse2.data.message);
            console.log('📊 User ID:', registerResponse2.data.data?.userId);
            console.log('📊 Verification Required:', registerResponse2.data.data?.requiresVerification);
            console.log('');
        } catch (registerError2) {
            console.log('❌ Registration Failed:', registerError2.response?.data?.message);
        }

        // Test 4: Check if we can get any existing users
        console.log('🔍 Test 4: Check Existing Users (if any)');
        try {
            // This might not work without auth, but let's try
            const usersResponse = await axios.get(`${PRODUCTION_URL}/api/v1/users/`);
            console.log('✅ Users Response:', usersResponse.data.message);
        } catch (usersError) {
            console.log('ℹ️ Users endpoint requires authentication (expected)');
        }

        console.log('🎉 Production Email Verification Test Completed!');
        console.log('');
        console.log('📊 Summary:');
        console.log('  - Health Check: ✅');
        console.log('  - Registration: Check results above');
        console.log('  - Email Sending: Check your email inbox');
        console.log('');
        console.log('💡 If no verification emails were received:');
        console.log('  1. Check Render environment variables');
        console.log('  2. Verify EMAIL_PASS is set correctly');
        console.log('  3. Check Render logs for SMTP errors');
        console.log('  4. Verify Gmail App Password is correct');

    } catch (error) {
        console.error('❌ Production Email Test Failed:', error.message);
        if (error.response) {
            console.error('📊 Response Status:', error.response.status);
            console.error('📊 Response Data:', error.response.data);
        }
    }
}

// Run the tests
testProductionEmailVerification();
