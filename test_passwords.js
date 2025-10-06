const axios = require('axios');

async function testDifferentPasswords() {
    console.log('🔑 Testing Different Passwords');
    console.log('==============================');
    
    const passwords = [
        'TestPassword123!',
        'TestPassword123',
        'testpassword123!',
        'TestPassword',
        'password123',
        'Password123!',
        'francois123',
        'Francois123!'
    ];
    
    for (const password of passwords) {
        try {
            console.log(`\n🔐 Testing password: ${password}`);
            const response = await axios.post('http://localhost:6000/api/v1/auth/login', {
                email: 'uwihoreyefrancois12@gmail.com',
                password: password
            });
            
            console.log('✅ Login successful!');
            console.log('📊 Response:', response.data);
            console.log(`🎉 Correct password is: ${password}`);
            return;
            
        } catch (error) {
            console.log(`❌ Failed with password: ${password}`);
        }
    }
    
    console.log('\n💡 None of the common passwords worked');
    console.log('🔧 Let\'s create a new account with known credentials');
    
    // Create a new account with known password
    try {
        console.log('\n📝 Creating new account with known password...');
        const response = await axios.post('http://localhost:6000/api/v1/auth/register', {
            sector: 'Kigali',
            fullname: 'Test User Fixed',
            position: 'Police Officer',
            email: 'test@findsinners.com',
            password: 'TestPassword123!',
            role: 'staff'
        });
        
        console.log('✅ New account created successfully!');
        console.log('📊 Response:', response.data);
        
        console.log('\n📧 Check email for verification');
        console.log('🔐 Login credentials:');
        console.log('   Email: test@findsinners.com');
        console.log('   Password: TestPassword123!');
        
    } catch (error) {
        console.log('❌ Failed to create new account');
        console.log('📊 Message:', error.response?.data?.message);
    }
}

testDifferentPasswords();
