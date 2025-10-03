const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:6000/api/v1/auth';
const TEST_EMAIL = 'uwihoreyefrancois12@gmail.com'; // Your Gmail address for testing

console.log('🧪 Testing Email Verification System');
console.log('=====================================');

// Test 1: Register a new user
async function testUserRegistration() {
    console.log('\n📝 Test 1: Registering a new user...');
    
    try {
        const userData = {
            sector: 'Kigali',
            fullname: 'Test User Email',
            position: 'Police Officer',
            email: TEST_EMAIL,
            password: 'TestPassword123!',
            role: 'staff'
        };

        const response = await axios.post(`${BASE_URL}/register`, userData);
        
        if (response.data.success) {
            console.log('✅ User registered successfully');
            console.log('📧 Check your email for verification link');
            console.log('📋 Response:', response.data);
            return true;
        } else {
            console.log('❌ Registration failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Registration error:', error.response?.data?.message || error.message);
        return false;
    }
}

// Test 2: Resend verification email
async function testResendVerification() {
    console.log('\n🔄 Test 2: Resending verification email...');
    
    try {
        const response = await axios.post(`${BASE_URL}/resend-verification`, {
            email: TEST_EMAIL
        });
        
        if (response.data.success) {
            console.log('✅ Resend verification email sent');
            console.log('📧 Check your email for the new verification link');
            console.log('📋 Response:', response.data);
            return true;
        } else {
            console.log('❌ Resend failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Resend error:', error.response?.data?.message || error.message);
        return false;
    }
}

// Test 3: Test login with unverified user (should fail)
async function testLoginUnverified() {
    console.log('\n🔐 Test 3: Testing login with unverified user (should fail)...');
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: 'TestPassword123!'
        });
        
        console.log('❌ Login should have failed but succeeded:', response.data);
        return false;
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Login correctly failed for unverified user');
            console.log('📋 Error message:', error.response.data.message);
            return true;
        } else {
            console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
            return false;
        }
    }
}

// Test 4: Manual verification (you'll need to get the token from email or console)
async function testManualVerification(token) {
    if (!token) {
        console.log('\n⚠️  Test 4: Manual verification skipped (no token provided)');
        console.log('💡 To test verification:');
        console.log('   1. Check your email for the verification link');
        console.log('   2. Copy the token from the URL');
        console.log('   3. Run: node test_email_verification.js verify YOUR_TOKEN');
        return false;
    }

    console.log('\n✅ Test 4: Testing manual verification...');
    
    try {
        const response = await axios.get(`${BASE_URL}/verify-email/${token}`);
        
        if (response.data.success) {
            console.log('✅ Email verification successful');
            console.log('📋 Response:', response.data);
            return true;
        } else {
            console.log('❌ Verification failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Verification error:', error.response?.data?.message || error.message);
        return false;
    }
}

// Test 5: Login with verified user (should succeed)
async function testLoginVerified() {
    console.log('\n🔐 Test 5: Testing login with verified user...');
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: 'TestPassword123!'
        });
        
        if (response.data.success) {
            console.log('✅ Login successful for verified user');
            console.log('📋 User data:', response.data.data.user);
            console.log('🔑 Access token received:', !!response.data.data.tokens.accessToken);
            return true;
        } else {
            console.log('❌ Login failed:', response.data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.response?.data?.message || error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting email verification tests...');
    console.log(`📧 Test email: ${TEST_EMAIL}`);
    console.log(`🌐 API URL: ${BASE_URL}`);
    
    const results = {
        registration: false,
        resend: false,
        loginUnverified: false,
        verification: false,
        loginVerified: false
    };

    // Run tests
    results.registration = await testUserRegistration();
    
    if (results.registration) {
        // Wait a moment for email to be sent
        console.log('\n⏳ Waiting 3 seconds for email to be sent...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        results.resend = await testResendVerification();
        results.loginUnverified = await testLoginUnverified();
        
        // Check if verification token was provided as command line argument
        const token = process.argv[2] === 'verify' ? process.argv[3] : null;
        results.verification = await testManualVerification(token);
        
        if (results.verification) {
            results.loginVerified = await testLoginVerified();
        }
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Registration: ${results.registration ? '✅' : '❌'}`);
    console.log(`Resend Email: ${results.resend ? '✅' : '❌'}`);
    console.log(`Login (Unverified): ${results.loginUnverified ? '✅' : '❌'}`);
    console.log(`Email Verification: ${results.verification ? '✅' : '❌'}`);
    console.log(`Login (Verified): ${results.loginVerified ? '✅' : '❌'}`);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Email verification is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the setup guide and try again.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testUserRegistration,
    testResendVerification,
    testLoginUnverified,
    testManualVerification,
    testLoginVerified,
    runTests
};
