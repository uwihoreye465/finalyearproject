const axios = require('axios');

async function registerAsAdmin() {
    console.log('👑 Registering as Admin User');
    console.log('============================');
    
    try {
        console.log('📝 Registering new admin user...');
        const response = await axios.post('http://localhost:6000/api/v1/auth/register', {
            sector: 'Kigali',
            fullname: 'Admin User',
            position: 'System Administrator',
            email: 'admin@findsinners.com',
            password: 'AdminPassword123!',
            role: 'admin'
        });
        
        console.log('✅ Admin user registered successfully!');
        console.log('📊 Status:', response.status);
        console.log('📊 Response:', response.data);
        
        console.log('\n📧 Check email for admin verification!');
        console.log('🔐 Admin users don\'t need approval');
        
    } catch (error) {
        console.log('❌ Admin registration failed');
        console.log('📊 Status:', error.response?.status);
        console.log('📊 Message:', error.response?.data?.message);
        
        if (error.response?.data?.message === 'User already exists with this email') {
            console.log('\n💡 Admin user already exists');
            console.log('🔐 Try logging in with admin credentials');
        }
    }
}

async function testAdminLogin() {
    console.log('\n🔐 Testing Admin Login');
    console.log('========================');
    
    try {
        const response = await axios.post('http://localhost:6000/api/v1/auth/login', {
            email: 'admin@findsinners.com',
            password: 'AdminPassword123!'
        });
        
        console.log('✅ Admin login successful!');
        console.log('📊 Response:', response.data);
        
    } catch (error) {
        console.log('❌ Admin login failed');
        console.log('📊 Message:', error.response?.data?.message);
    }
}

// Run both functions
registerAsAdmin().then(() => {
    setTimeout(testAdminLogin, 2000);
});
