const axios = require('axios');

console.log('🧪 Testing Email Verification System');
console.log('====================================');

const BASE_URL = 'http://localhost:6000/api/v1/auth';
const TEST_EMAIL = 'uwihoreyefrancois12@gmail.com';

async function testEmailVerification() {
    console.log('\n📝 Step 1: Registering a new user...');
    
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            sector: 'Kigali',
            fullname: 'Test User Email Verification',
            position: 'Police Officer',
            email: TEST_EMAIL,
            password: 'TestPassword123!',
            role: 'staff'
        });
        
        console.log('✅ User registered successfully');
        console.log('📧 Check your email for verification link');
        console.log('📋 Response:', response.data);
        
        // Wait a moment for email to be sent
        console.log('\n⏳ Waiting 3 seconds for email to be sent...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n🔐 Step 2: Testing login before verification (should fail)...');
        
        try {
            await axios.post(`${BASE_URL}/login`, {
                email: TEST_EMAIL,
                password: 'TestPassword123!'
            });
            console.log('❌ Login should have failed but succeeded');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Login correctly failed for unverified user');
                console.log('📋 Error message:', error.response.data.message);
            } else {
                console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            }
        }
        
        console.log('\n🔄 Step 3: Testing resend verification...');
        
        try {
            const resendResponse = await axios.post(`${BASE_URL}/resend-verification`, {
                email: TEST_EMAIL
            });
            console.log('✅ Resend verification email sent');
            console.log('📋 Response:', resendResponse.data);
        } catch (error) {
            console.log('❌ Resend failed:', error.response?.data?.message || error.message);
        }
        
        console.log('\n📧 Step 4: Email Verification Instructions');
        console.log('==========================================');
        console.log('1. Check your email inbox for verification email');
        console.log('2. Click the verification button in the email');
        console.log('3. Or copy the verification token from the email URL');
        console.log('4. Use the token to verify via API:');
        console.log(`   GET ${BASE_URL}/verify-email/YOUR_TOKEN_HERE`);
        console.log('5. After verification, try logging in again');
        
        console.log('\n🎯 Test completed! Check your email for the verification link.');
        
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    }
}

// Run the test
testEmailVerification().catch(console.error);
