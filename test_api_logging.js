const axios = require('axios');

console.log('🧪 Testing Email Verification API with Console Logging');
console.log('=====================================================');

const BASE_URL = 'http://localhost:6000/api/v1/auth';
const TEST_EMAIL = 'uwihoreyefrancois12@gmail.com';

async function testRegistrationWithLogging() {
    console.log('\n📝 Testing Registration API...');
    console.log('📧 Test Email:', TEST_EMAIL);
    console.log('🌐 API URL:', `${BASE_URL}/register`);
    
    try {
        const response = await axios.post(`${BASE_URL}/register`, {
            sector: 'Kigali',
            fullname: 'Test User Console Logging',
            position: 'Police Officer',
            email: TEST_EMAIL,
            password: 'TestPassword123!',
            role: 'staff'
        });
        
        console.log('\n✅ Registration Response:');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        // Wait for email to be processed
        console.log('\n⏳ Waiting 3 seconds for email processing...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        return true;
    } catch (error) {
        console.log('\n❌ Registration Error:');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        return false;
    }
}

async function testResendVerificationWithLogging() {
    console.log('\n🔄 Testing Resend Verification API...');
    console.log('📧 Test Email:', TEST_EMAIL);
    console.log('🌐 API URL:', `${BASE_URL}/resend-verification`);
    
    try {
        const response = await axios.post(`${BASE_URL}/resend-verification`, {
            email: TEST_EMAIL
        });
        
        console.log('\n✅ Resend Verification Response:');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        return true;
    } catch (error) {
        console.log('\n❌ Resend Verification Error:');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        return false;
    }
}

async function testLoginBeforeVerification() {
    console.log('\n🔐 Testing Login Before Verification...');
    console.log('📧 Test Email:', TEST_EMAIL);
    console.log('🌐 API URL:', `${BASE_URL}/login`);
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: 'TestPassword123!'
        });
        
        console.log('\n❌ Login should have failed but succeeded:');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        return false;
    } catch (error) {
        console.log('\n✅ Login correctly failed (as expected):');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        return true;
    }
}

async function testEmailVerificationWithLogging(token) {
    if (!token) {
        console.log('\n⚠️  Email Verification Test Skipped');
        console.log('💡 To test email verification:');
        console.log('   1. Check your email for verification link');
        console.log('   2. Copy the token from the URL');
        console.log('   3. Run: node test_api_logging.js verify YOUR_TOKEN');
        return false;
    }

    console.log('\n✅ Testing Email Verification API...');
    console.log('🎫 Verification Token:', token);
    console.log('🌐 API URL:', `${BASE_URL}/verify-email/${token}`);
    
    try {
        const response = await axios.get(`${BASE_URL}/verify-email/${token}`);
        
        console.log('\n✅ Email Verification Response:');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        return true;
    } catch (error) {
        console.log('\n❌ Email Verification Error:');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        return false;
    }
}

async function testLoginAfterVerification() {
    console.log('\n🔐 Testing Login After Verification...');
    console.log('📧 Test Email:', TEST_EMAIL);
    console.log('🌐 API URL:', `${BASE_URL}/login`);
    
    try {
        const response = await axios.post(`${BASE_URL}/login`, {
            email: TEST_EMAIL,
            password: 'TestPassword123!'
        });
        
        console.log('\n✅ Login After Verification Response:');
        console.log('📊 Status:', response.status);
        console.log('📊 Data:', response.data);
        
        return true;
    } catch (error) {
        console.log('\n❌ Login After Verification Error:');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting API Testing with Console Logging...');
    console.log('📅 Test started at:', new Date().toISOString());
    console.log('🌐 Backend URL:', BASE_URL);
    
    const results = {
        registration: false,
        resend: false,
        loginBefore: false,
        verification: false,
        loginAfter: false
    };

    // Test registration
    results.registration = await testRegistrationWithLogging();
    
    if (results.registration) {
        // Test resend verification
        results.resend = await testResendVerificationWithLogging();
        
        // Test login before verification
        results.loginBefore = await testLoginBeforeVerification();
        
        // Test email verification if token provided
        const token = process.argv[2] === 'verify' ? process.argv[3] : null;
        results.verification = await testEmailVerificationWithLogging(token);
        
        // Test login after verification
        if (results.verification) {
            results.loginAfter = await testLoginAfterVerification();
        }
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Registration: ${results.registration ? '✅' : '❌'}`);
    console.log(`Resend Verification: ${results.resend ? '✅' : '❌'}`);
    console.log(`Login (Before Verification): ${results.loginBefore ? '✅' : '❌'}`);
    console.log(`Email Verification: ${results.verification ? '✅' : '❌'}`);
    console.log(`Login (After Verification): ${results.loginAfter ? '✅' : '❌'}`);

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Check your backend console for detailed logging.');
    } else {
        console.log('⚠️  Some tests failed. Check the backend console for error details.');
    }
    
    console.log('\n📋 What to Check in Backend Console:');
    console.log('====================================');
    console.log('1. 🚀 API call logs with timestamps');
    console.log('2. 📧 Email sending attempts and results');
    console.log('3. 🔍 Database query logs');
    console.log('4. ✅ Success/error status messages');
    console.log('5. 🎫 Verification token generation');
    console.log('6. 📊 Response status and data');
}

// Run tests
runTests().catch(console.error);
