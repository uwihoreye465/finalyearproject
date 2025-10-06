const axios = require('axios');

async function testSpecificUser() {
    console.log('🧪 Testing Specific User Registration');
    console.log('====================================');
    
    const userData = {
        sector: "kicukiro",
        fullname: "francois",
        position: "Engineer",
        email: "uwihoreyefrancois12@gmail.com",
        password: "Fra/12345@!",
        role: "staff"
    };
    
    console.log('📋 User Data:');
    console.log('   Sector:', userData.sector);
    console.log('   Full Name:', userData.fullname);
    console.log('   Position:', userData.position);
    console.log('   Email:', userData.email);
    console.log('   Password:', '[HIDDEN]');
    console.log('   Role:', userData.role);
    
    try {
        console.log('\n📝 Step 1: Registering user...');
        const registerResponse = await axios.post('http://localhost:6000/api/v1/auth/register', userData);
        
        console.log('✅ Registration successful!');
        console.log('📊 Status:', registerResponse.status);
        console.log('📊 Response:', registerResponse.data);
        
        console.log('\n📧 Step 2: Check your Gmail inbox!');
        console.log('📧 Look for: "🔐 Verify Your Email - FindSinners System"');
        console.log('📧 From: uwihoreyefrancois12@gmail.com');
        
        // Wait a moment for email processing
        console.log('\n⏳ Waiting 3 seconds for email processing...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n🔐 Step 3: Testing login before verification (should fail)...');
        try {
            const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                email: userData.email,
                password: userData.password
            });
            
            console.log('❌ Login should have failed but succeeded');
            console.log('📊 Response:', loginResponse.data);
            
        } catch (loginError) {
            console.log('✅ Login correctly failed (as expected)');
            console.log('📊 Error:', loginError.response?.data?.message);
        }
        
        console.log('\n🔄 Step 4: Testing resend verification...');
        try {
            const resendResponse = await axios.post('http://localhost:6000/api/v1/auth/resend-verification', {
                email: userData.email
            });
            
            console.log('✅ Resend verification successful!');
            console.log('📊 Response:', resendResponse.data);
            
        } catch (resendError) {
            console.log('❌ Resend verification failed');
            console.log('📊 Error:', resendError.response?.data?.message);
        }
        
        console.log('\n📋 Step 5: Next Steps');
        console.log('===================');
        console.log('1. Check your Gmail inbox for verification email');
        console.log('2. Click the verification button in the email');
        console.log('3. Use Microsoft Edge or Firefox (Chrome blocks port 6000)');
        console.log('4. After verification, test login again');
        console.log('5. If login fails with "pending admin approval", run approval script');
        
        console.log('\n🎯 Expected Results:');
        console.log('===================');
        console.log('✅ Registration: Success');
        console.log('✅ Email sent: Check Gmail');
        console.log('✅ Login before verification: Should fail');
        console.log('✅ Resend verification: Should work');
        console.log('✅ After verification: Login should work');
        
    } catch (error) {
        console.log('❌ Registration failed');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        
        if (error.response?.data?.message === 'User already exists with this email') {
            console.log('\n💡 User already exists. Testing with existing account...');
            
            // Test login with existing account
            try {
                const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                    email: userData.email,
                    password: userData.password
                });
                
                console.log('✅ Login successful with existing account!');
                console.log('📊 Response:', loginResponse.data);
                
            } catch (loginError) {
                console.log('❌ Login failed with existing account');
                console.log('📊 Error:', loginError.response?.data?.message);
                
                if (loginError.response?.data?.message === 'Please verify your email before logging in') {
                    console.log('\n📧 Account exists but not verified');
                    console.log('📧 Check Gmail for verification email');
                } else if (loginError.response?.data?.message === 'Your account is pending admin approval') {
                    console.log('\n👑 Account verified but needs admin approval');
                    console.log('🔧 Run approval script to fix this');
                }
            }
        }
    }
}

testSpecificUser();
