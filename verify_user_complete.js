const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.gonvkoktmshcsuwolcvc:YisIxGt6jvLlp7Ki@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
});

async function getVerificationTokenAndVerify() {
    console.log('🔍 Getting Verification Token and Completing Verification');
    console.log('========================================================');
    
    try {
        // Get the latest user with verification token
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
            ['uwihoreyefrancois12@gmail.com']
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('📧 User Details:');
            console.log(`   ID: ${user.user_id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.fullname}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Verified: ${user.is_verified ? '✅' : '❌'}`);
            console.log(`   Approved: ${user.is_approved ? '✅' : '❌'}`);
            console.log(`   Token: ${user.verification_token}`);
            console.log(`   Created: ${user.created_at}`);
            
            if (user.verification_token && !user.is_verified) {
                console.log('\n🔗 Verification URL:');
                console.log(`http://localhost:6000/api/v1/auth/verify-email/${user.verification_token}`);
                
                console.log('\n🔄 Verifying email via API...');
                const axios = require('axios');
                
                try {
                    const response = await axios.get(`http://localhost:6000/api/v1/auth/verify-email/${user.verification_token}`);
                    console.log('✅ Email verification successful!');
                    console.log('📊 Response:', response.data);
                    
                    // Check database after verification
                    const updatedUser = await pool.query(
                        'SELECT is_verified, verification_token FROM users WHERE user_id = $1',
                        [user.user_id]
                    );
                    
                    console.log('\n📊 Database after verification:');
                    console.log(`   Verified: ${updatedUser.rows[0].is_verified ? '✅' : '❌'}`);
                    console.log(`   Token: ${updatedUser.rows[0].verification_token}`);
                    
                    if (updatedUser.rows[0].is_verified) {
                        console.log('\n👑 Approving staff user...');
                        await pool.query(
                            'UPDATE users SET is_approved = true WHERE user_id = $1',
                            [user.user_id]
                        );
                        console.log('✅ User approved successfully!');
                        
                        // Test login
                        console.log('\n🧪 Testing login after verification and approval...');
                        try {
                            const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                                email: user.email,
                                password: 'Fra/12345@!'
                            });
                            
                            console.log('✅ Login successful!');
                            console.log('📊 Login response:', loginResponse.data);
                            
                            console.log('\n🎉 SUCCESS! Your email verification system is working perfectly!');
                            console.log('🔐 You can now login with:');
                            console.log(`   Email: ${user.email}`);
                            console.log('   Password: Fra/12345@!');
                            
                        } catch (loginError) {
                            console.log('❌ Login failed:', loginError.response?.data?.message);
                        }
                    }
                    
                } catch (error) {
                    console.log('❌ Verification API failed:', error.response?.data?.message || error.message);
                }
            } else if (user.is_verified) {
                console.log('\n✅ User is already verified!');
                
                if (!user.is_approved) {
                    console.log('👑 Approving user...');
                    await pool.query(
                        'UPDATE users SET is_approved = true WHERE user_id = $1',
                        [user.user_id]
                    );
                    console.log('✅ User approved!');
                }
                
                // Test login
                console.log('\n🧪 Testing login...');
                const axios = require('axios');
                try {
                    const loginResponse = await axios.post('http://localhost:6000/api/v1/auth/login', {
                        email: user.email,
                        password: 'Fra/12345@!'
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

getVerificationTokenAndVerify();
