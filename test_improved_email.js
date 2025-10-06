const axios = require('axios');

async function testNewUserWithImprovedEmail() {
    console.log('📧 Testing New User with Improved Email Template');
    console.log('===============================================');
    
    try {
        // Register a new test user
        console.log('📝 Registering new test user...');
        const registerResponse = await axios.post('http://localhost:6000/api/v1/auth/register', {
            sector: 'Kigali',
            fullname: 'Test User Chrome Fix',
            position: 'Police Officer',
            email: 'test.chrome@findsinners.com',
            password: 'TestPassword123!',
            role: 'staff'
        });
        
        console.log('✅ Registration successful!');
        console.log('📊 Response:', registerResponse.data);
        
        console.log('\n📧 Check your Gmail inbox for the IMPROVED verification email!');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        console.log('📧 From: uwihoreyefrancois12@gmail.com');
        
        console.log('\n🎯 The improved email now includes:');
        console.log('✅ Chrome warning about ERR_UNSAFE_PORT');
        console.log('✅ Instructions to use Edge or Firefox');
        console.log('✅ Verification token for manual verification');
        console.log('✅ Alternative methods section');
        console.log('✅ Clear instructions for Chrome users');
        
        console.log('\n🔧 Solutions for Chrome Users:');
        console.log('=============================');
        console.log('1. 🌐 Use Microsoft Edge or Firefox');
        console.log('2. 🔑 Copy verification token from email');
        console.log('3. 📄 Open email_verification_page.html');
        console.log('4. 🚀 Run start_chrome_safe.bat');
        
    } catch (error) {
        console.log('❌ Registration failed');
        console.log('📊 Error:', error.response?.data?.message);
        
        if (error.response?.data?.message === 'User already exists with this email') {
            console.log('\n💡 User already exists. Sending resend verification...');
            
            try {
                const resendResponse = await axios.post('http://localhost:6000/api/v1/auth/resend-verification', {
                    email: 'test.chrome@findsinners.com'
                });
                
                console.log('✅ Resend verification successful!');
                console.log('📊 Response:', resendResponse.data);
                
                console.log('\n📧 Check Gmail for improved verification email!');
                
            } catch (resendError) {
                console.log('❌ Resend failed:', resendError.response?.data?.message);
            }
        }
    }
}

testNewUserWithImprovedEmail();
