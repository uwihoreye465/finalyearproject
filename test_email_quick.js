const axios = require('axios');

async function testEmailQuick() {
    console.log('🧪 Quick Email Test for Production...\n');

    try {
        // Test registration with a real email
        const testUser = {
            fullname: 'Email Test User',
            email: 'uwihoreyefrancois12@gmail.com', // Use your real email
            password: 'Test123!',
            sector: 'Kigali',
            position: 'Officer',
            role: 'staff'
        };

        console.log('📧 Testing registration with your email:', testUser.email);
        console.log('📧 This should send a verification email to your inbox...\n');

        const response = await axios.post('https://tracking-criminal.onrender.com/api/v1/auth/register', testUser);

        console.log('✅ Registration Response:');
        console.log('  - Success:', response.data.success);
        console.log('  - Message:', response.data.message);
        
        if (response.data.success) {
            console.log('\n📧 CHECK YOUR EMAIL INBOX NOW!');
            console.log('📧 Look for email from: uwihoreyefrancois12@gmail.com');
            console.log('📧 Subject: USER VERIFICATION - Email Verification Required');
            console.log('\n💡 If you don\'t see the email:');
            console.log('   1. Check spam folder');
            console.log('   2. Go to Render Dashboard');
            console.log('   3. Add environment variables (see RENDER_EMAIL_FIX_STEPS.md)');
        }

    } catch (error) {
        if (error.response?.status === 409) {
            console.log('⚠️ User already exists. Trying login instead...');
            
            try {
                const loginResponse = await axios.post('https://tracking-criminal.onrender.com/api/v1/auth/login', {
                    email: 'uwihoreyefrancois12@gmail.com',
                    password: 'Test123!'
                });
                console.log('✅ Login successful:', loginResponse.data.message);
            } catch (loginError) {
                console.log('❌ Login failed:', loginError.response?.data?.message);
            }
        } else {
            console.error('❌ Registration failed:', error.response?.data?.message || error.message);
        }
    }
}

testEmailQuick();
