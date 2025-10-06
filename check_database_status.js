const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.gonvkoktmshcsuwolcvc:YisIxGt6jvLlp7Ki@aws-0-sa-east-1.pooler.supabase.com:5432/postgres'
});

async function checkDatabaseStatus() {
    console.log('🔍 Checking Database Status');
    console.log('==========================');
    
    try {
        // Check all users and their verification status
        console.log('📊 Checking all users in database...');
        const result = await pool.query(`
            SELECT user_id, email, fullname, role, is_verified, is_approved, verification_token, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        
        console.log('\n👥 All Users in Database:');
        console.log('========================');
        
        result.rows.forEach((user, index) => {
            console.log(`\n${index + 1}. User ID: ${user.user_id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Name: ${user.fullname}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Verified: ${user.is_verified ? '✅' : '❌'}`);
            console.log(`   Approved: ${user.is_approved ? '✅' : '❌'}`);
            console.log(`   Token: ${user.verification_token ? user.verification_token.substring(0, 20) + '...' : 'None'}`);
            console.log(`   Created: ${user.created_at}`);
        });
        
        // Check specifically for uwihoreyefrancois12@gmail.com
        console.log('\n🔍 Checking uwihoreyefrancois12@gmail.com specifically...');
        const userResult = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['uwihoreyefrancois12@gmail.com']
        );
        
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            console.log('\n📧 User Details:');
            console.log(`   ID: ${user.user_id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Verified: ${user.is_verified}`);
            console.log(`   Approved: ${user.is_approved}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Token: ${user.verification_token}`);
            
            if (!user.is_verified) {
                console.log('\n🔧 User is not verified. Let\'s verify manually...');
                await verifyUserManually(user.user_id);
            }
            
            if (!user.is_approved && user.role === 'staff') {
                console.log('\n👑 User needs admin approval. Let\'s approve manually...');
                await approveUserManually(user.user_id);
            }
        } else {
            console.log('❌ User not found in database');
        }
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

async function verifyUserManually(userId) {
    try {
        console.log(`🔄 Manually verifying user ID: ${userId}`);
        
        const result = await pool.query(
            'UPDATE users SET is_verified = true, verification_token = NULL WHERE user_id = $1 RETURNING *',
            [userId]
        );
        
        if (result.rows.length > 0) {
            console.log('✅ User verified successfully!');
            console.log('📊 Updated user:', result.rows[0]);
        } else {
            console.log('❌ Failed to verify user');
        }
    } catch (error) {
        console.error('❌ Verification error:', error.message);
    }
}

async function approveUserManually(userId) {
    try {
        console.log(`👑 Manually approving user ID: ${userId}`);
        
        const result = await pool.query(
            'UPDATE users SET is_approved = true WHERE user_id = $1 RETURNING *',
            [userId]
        );
        
        if (result.rows.length > 0) {
            console.log('✅ User approved successfully!');
            console.log('📊 Updated user:', result.rows[0]);
        } else {
            console.log('❌ Failed to approve user');
        }
    } catch (error) {
        console.error('❌ Approval error:', error.message);
    }
}

checkDatabaseStatus();
