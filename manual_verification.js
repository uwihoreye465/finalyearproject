const axios = require('axios');

async function manualVerification() {
    console.log('🔧 Manual Email Verification Helper');
    console.log('==================================');
    
    console.log('\n📧 Since Chrome blocks port 6000, you can verify manually:');
    console.log('\n1. Copy the verification token from your email');
    console.log('2. Use this script to verify your account');
    console.log('3. Or use a different browser (Edge, Firefox)');
    
    // Get verification token from user
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('\n🎫 Enter your verification token from the email: ', async (token) => {
        if (!token || token.trim() === '') {
            console.log('❌ No token provided');
            rl.close();
            return;
        }
        
        try {
            console.log('\n🔄 Verifying email with token:', token.substring(0, 10) + '...');
            
            const response = await axios.get(`http://localhost:6000/api/v1/auth/verify-email/${token.trim()}`);
            
            console.log('✅ Email verification successful!');
            console.log('📊 Response:', response.data);
            
            console.log('\n🎉 Your account is now verified!');
            console.log('🔐 You can now login to your account');
            
        } catch (error) {
            console.log('❌ Email verification failed');
            console.log('📊 Status:', error.response?.status);
            console.log('📊 Message:', error.response?.data?.message);
            console.log('\n💡 Make sure:');
            console.log('   - Your server is running on port 6000');
            console.log('   - The token is correct');
            console.log('   - The token hasn\'t expired');
        }
        
        rl.close();
    });
}

manualVerification();
