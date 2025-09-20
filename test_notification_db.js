const pool = require('./src/config/database');

async function testNotificationDB() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const testQuery = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', testQuery.rows[0]);
    
    // Check if notification table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notification'
      );
    `);
    console.log('📋 Notification table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check table structure
      const tableStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'notification' 
        ORDER BY ordinal_position;
      `);
      console.log('🏗️ Table structure:');
      tableStructure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Test insert
      console.log('🧪 Testing notification insert...');
      const testInsert = await pool.query(`
        INSERT INTO notification (near_rib, fullname, address, phone, message, gps_latitude, gps_longitude, location_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
      `, ['TEST_RIB', 'Test User', 'Test Address', '123456789', 'Test message', -1.9441, 30.0619, 'Kigali, Rwanda']);
      
      console.log('✅ Test insert successful:', testInsert.rows[0]);
      
      // Clean up test data
      await pool.query('DELETE FROM notification WHERE near_rib = $1', ['TEST_RIB']);
      console.log('🧹 Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testNotificationDB();
