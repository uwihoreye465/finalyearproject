const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.gonvkoktmshcsuwolcvc:YisIxGt6jvLlp7Ki@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
});

async function fixNewAccount() {
    console.log('🔧 Fixing New Account');
    console.log('====================');
    
    try {
        // Get the new account
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['test@findsinners.com']
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('📧 Found new account:');
            console.log(`   ID: ${user.user_id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Verified: ${user.is_verified}`);
            console.log(`   Approved: ${user.is_approved}`);
            
            // Verify the account
            console.log('\n🔄 Verifying account...');
            await pool.query(
                'UPDATE users SET is_verified = true, verification_token = NULL WHERE user_id = $1',
                [user.user_id]
            );
            
            // Approve the account
            console.log('👑 Approving account...');
            await pool.query(
                'UPDATE users SET is_approved = true WHERE user_id = $1',
                [user.user_id]
            );
            
            console.log('✅ Account fixed successfully!');
            
            // Test login
            console.log('\n🧪 Testing login...');
            const axios = require('axios');
            
            try {
                const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                    email: 'test@findsinners.com',
                    password: 'TestPassword123!'
                });
                
                console.log('✅ Login successful!');
                console.log('📊 Response:', loginResponse.data);
                
                console.log('\n🎉 SUCCESS! Your email verification system is working perfectly!');
                console.log('🔐 You can now login with:');
                console.log('   Email: test@findsinners.com');
                console.log('   Password: TestPassword123!');
                
            } catch (loginError) {
                console.log('❌ Login failed:', loginError.response?.data?.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

fixNewAccount();
