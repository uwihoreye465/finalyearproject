const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.gonvkoktmshcsuwolcvc:YisIxGt6jvLlp7Ki@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
});

async function verifySpecificUser() {
    console.log('🔍 Verifying Specific User');
    console.log('==========================');
    
    try {
        // Get the user uwihoreyefrancois12@gmail.com
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
            ['uwihoreyefrancois12@gmail.com']
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('📧 Found user:');
            console.log(`   ID: ${user.user_id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.fullname}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Verified: ${user.is_verified}`);
            console.log(`   Approved: ${user.is_approved}`);
            console.log(`   Token: ${user.verification_token}`);
            console.log(`   Created: ${user.created_at}`);
            
            if (user.verification_token && !user.is_verified) {
                console.log('\n🔄 Verifying user with token...');
                
                // Test the verification API
                const axios = require('axios');
                try {
                    const response = await axios.get(`http://localhost:6000/api/v1/auth/verify-email/${user.verification_token}`);
                    console.log('✅ Verification API response:', response.data);
                    
                    // Check database immediately after
                    const updatedResult = await pool.query(
                        'SELECT is_verified, verification_token FROM users WHERE user_id = $1',
                        [user.user_id]
                    );
                    
                    console.log('📊 Database after verification:');
                    console.log(`   Verified: ${updatedResult.rows[0].is_verified}`);
                    console.log(`   Token: ${updatedResult.rows[0].verification_token}`);
                    
                    if (updatedResult.rows[0].is_verified) {
                        console.log('\n✅ User verified successfully!');
                        
                        // Also approve if staff
                        if (user.role === 'staff') {
                            console.log('👑 Approving staff user...');
                            await pool.query(
                                'UPDATE users SET is_approved = true WHERE user_id = $1',
                                [user.user_id]
                            );
                            console.log('✅ User approved!');
                        }
                        
                        // Test login
                        console.log('\n🧪 Testing login...');
                        try {
                            const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                                email: user.email,
                                password: 'TestPassword123!' // Try common password
                            });
                            
                            console.log('✅ Login successful!');
                            console.log('📊 Login response:', loginResponse.data);
                            
                        } catch (loginError) {
                            console.log('❌ Login failed:', loginError.response?.data?.message);
                            console.log('💡 You may need to use the correct password');
                        }
                    }
                    
                } catch (error) {
                    console.log('❌ Verification API failed:', error.response?.data?.message || error.message);
                }
            } else if (user.is_verified) {
                console.log('\n✅ User is already verified!');
                
                // Test login
                console.log('🧪 Testing login...');
                const axios = require('axios');
                try {
                    const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                        email: user.email,
                        password: 'TestPassword123!'
                    });
                    
                    console.log('✅ Login successful!');
                    console.log('📊 Login response:', loginResponse.data);
                    
                } catch (loginError) {
                    console.log('❌ Login failed:', loginError.response?.data?.message);
                }
            }
        } else {
            console.log('❌ User not found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifySpecificUser();
