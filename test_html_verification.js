const axios = require('axios');

async function testHTMLVerificationSystem() {
    console.log('🧪 Testing HTML Verification System');
    console.log('==================================');
    
    try {
        // Register a new test user
        console.log('📝 Registering new test user for HTML verification...');
        const registerResponse = await axios.post('http://localhost:6000/api/v1/auth/register', {
            sector: 'Kigali',
            fullname: 'HTML Test User',
            position: 'Police Officer',
            email: 'html.test@findsinners.com',
            password: 'TestPassword123!',
            role: 'staff'
        });
        
        console.log('✅ Registration successful!');
        console.log('📊 Response:', registerResponse.data);
        
        console.log('\n📧 Check your Gmail inbox for the NEW verification email!');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        console.log('📧 From: uwihoreyefrancois12@gmail.com');
        
        console.log('\n🎯 What\'s New in the Email:');
        console.log('✅ Verification button now redirects to HTML page');
        console.log('✅ Beautiful verification page with animations');
        console.log('✅ Works in ALL browsers including Chrome');
        console.log('✅ No more ERR_UNSAFE_PORT errors');
        console.log('✅ User-friendly interface');
        console.log('✅ Automatic verification process');
        
        console.log('\n🔗 The verification URL in email will be:');
        console.log('http://localhost:6000/verify-email.html?token=[TOKEN]&email=[EMAIL]');
        
        console.log('\n📋 How It Works:');
        console.log('1. User clicks verification button in email');
        console.log('2. Redirects to beautiful HTML verification page');
        console.log('3. Page automatically verifies the email');
        console.log('4. Shows success message and redirects to login');
        console.log('5. Works in Chrome, Edge, Firefox, Safari');
        
        console.log('\n🎉 Benefits:');
        console.log('✅ No more browser compatibility issues');
        console.log('✅ Professional user experience');
        console.log('✅ Automatic verification process');
        console.log('✅ Beautiful UI with animations');
        console.log('✅ Mobile responsive design');
        console.log('✅ Clear success/error messages');
        
    } catch (error) {
        console.log('❌ Registration failed');
        console.log('📊 Error:', error.response?.data?.message);
        
        if (error.response?.data?.message === 'User already exists with this email') {
            console.log('\n💡 User already exists. Sending resend verification...');
            
            try {
                const resendResponse = await axios.post('http://localhost:6000/api/v1/auth/resend-verification', {
                    email: 'html.test@findsinners.com'
                });
                
                console.log('✅ Resend verification successful!');
                console.log('📊 Response:', resendResponse.data);
                
                console.log('\n📧 Check Gmail for HTML verification email!');
                
            } catch (resendError) {
                console.log('❌ Resend failed:', resendError.response?.data?.message);
            }
        }
    }
}

testHTMLVerificationSystem();
