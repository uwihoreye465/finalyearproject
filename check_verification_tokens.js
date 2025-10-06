const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.gonvkoktmshcsuwolcvc:YisIxGt6jvLlp7Ki@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
});

async function checkVerificationTokens() {
    console.log('🔍 Checking Verification Tokens in Database');
    console.log('==========================================');
    
    try {
        // Get all users with verification tokens
        const result = await pool.query(`
            SELECT user_id, email, fullname, role, verification_token, is_verified, created_at 
            FROM users 
            WHERE verification_token IS NOT NULL 
            ORDER BY created_at DESC
        `);
        
        console.log('\n📧 Users with Active Verification Tokens:');
        console.log('==========================================');
        
        result.rows.forEach((user, index) => {
            console.log(`\n${index + 1}. User ID: ${user.user_id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.fullname}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Verified: ${user.is_verified ? '✅' : '❌'}`);
            console.log(`   Token: ${user.verification_token}`);
            console.log(`   Created: ${user.created_at}`);
            console.log(`   Verification URL: http://localhost:6000/api/v1/auth/verify-email/${user.verification_token}`);
        });
        
        // Test verification API for the most recent user
        if (result.rows.length > 0) {
            const latestUser = result.rows[0];
            console.log(`\n🧪 Testing verification API for latest user (ID: ${latestUser.user_id})...`);
            
            const axios = require('axios');
            try {
                const response = await axios.get(`http://localhost:6000/api/v1/auth/verify-email/${latestUser.verification_token}`);
                console.log('✅ Verification API response:', response.data);
                
                // Check if database was updated
                const updatedUser = await pool.query(
                    'SELECT is_verified FROM users WHERE user_id = $1',
                    [latestUser.user_id]
                );
                
                console.log('📊 Database updated:', updatedUser.rows[0].is_verified ? '✅' : '❌');
                
            } catch (error) {
                console.log('❌ Verification API failed:', error.response?.data?.message || error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkVerificationTokens();
