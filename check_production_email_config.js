const axios = require('axios');

async function checkProductionEmailConfig() {
    console.log('🔍 Checking Production Email Configuration...\n');

    try {
        // Test 1: Register a user and check server logs
        console.log('📧 Testing email configuration by registering a user...');
        
        const testUser = {
            fullname: 'Email Test User',
            email: `email-test-${Date.now()}@example.com`,
            password: 'Test123!',
            sector: 'Kigali',
            position: 'Officer',
            role: 'staff'
        };

        console.log('📧 Registering user:', testUser.email);
        
        const response = await axios.post('https://tracking-criminal.onrender.com/api/v1/auth/register', testUser, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Registration Response:');
        console.log('  - Success:', response.data.success);
        console.log('  - Message:', response.data.message);
        console.log('  - User ID:', response.data.data?.userId);
        console.log('  - Requires Verification:', response.data.data?.requiresVerification);
        
        if (response.data.success && response.data.data?.requiresVerification) {
            console.log('✅ Email verification should have been sent!');
            console.log('📧 Check your email inbox for verification email.');
            console.log('📧 From: uwihoreyefrancois12@gmail.com');
            console.log('📧 Subject: USER VERIFICATION - Email Verification Required');
        } else {
            console.log('❌ Email verification might not have been sent.');
            console.log('💡 This indicates missing environment variables on Render.');
        }

    } catch (error) {
        console.error('❌ Error testing email configuration:', error.message);
        
        if (error.response) {
            console.error('📊 Response Status:', error.response.status);
            console.error('📊 Response Data:', error.response.data);
            
            if (error.response.status === 500) {
                console.log('💡 500 error suggests server-side issue, likely missing environment variables.');
            }
        }
    }

    console.log('\n🔧 To fix email verification on production:');
    console.log('1. Go to Render Dashboard');
    console.log('2. Click your service (tracking-criminal)');
    console.log('3. Go to "Environment" tab');
    console.log('4. Add these environment variables:');
    console.log('   EMAIL_HOST=smtp.gmail.com');
    console.log('   EMAIL_PORT=587');
    console.log('   EMAIL_USER=uwihoreyefrancois12@gmail.com');
    console.log('   EMAIL_PASS=ngjv fqel gbjo rdmt');
    console.log('   FRONTEND_URL=https://tracking-criminal.onrender.com');
    console.log('5. Save and restart the service');
}

checkProductionEmailConfig();
