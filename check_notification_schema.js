const pool = require('./src/config/database');

async function checkNotificationSchema() {
  try {
    console.log('🔍 Checking notification table schema...');
    
    // Get table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'notification' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current notification table structure:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if GPS columns exist
    const hasGpsLatitude = tableStructure.rows.some(col => col.column_name === 'gps_latitude');
    const hasGpsLongitude = tableStructure.rows.some(col => col.column_name === 'gps_longitude');
    const hasLocationName = tableStructure.rows.some(col => col.column_name === 'location_name');
    
    console.log('\n📍 GPS columns status:');
    console.log(`  - gps_latitude: ${hasGpsLatitude ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - gps_longitude: ${hasGpsLongitude ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - location_name: ${hasLocationName ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasGpsLatitude || !hasGpsLongitude || !hasLocationName) {
      console.log('\n🔧 Adding missing GPS columns...');
      
      if (!hasGpsLatitude) {
        await pool.query('ALTER TABLE notification ADD COLUMN gps_latitude DECIMAL(10, 8)');
        console.log('✅ Added gps_latitude column');
      }
      
      if (!hasGpsLongitude) {
        await pool.query('ALTER TABLE notification ADD COLUMN gps_longitude DECIMAL(11, 8)');
        console.log('✅ Added gps_longitude column');
      }
      
      if (!hasLocationName) {
        await pool.query('ALTER TABLE notification ADD COLUMN location_name VARCHAR(200)');
        console.log('✅ Added location_name column');
      }
      
      console.log('🎉 All GPS columns added successfully!');
    } else {
      console.log('✅ All GPS columns already exist!');
    }
    
    // Test insert
    console.log('\n🧪 Testing notification insert...');
    const testInsert = await pool.query(`
      INSERT INTO notification (near_rib, fullname, address, phone, message, gps_latitude, gps_longitude, location_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, ['TEST_RIB', 'Test User', 'Test Address', '123456789', 'Test message', -1.9441, 30.0619, 'Kigali, Rwanda']);
    
    console.log('✅ Test insert successful:', testInsert.rows[0]);
    
    // Clean up test data
    await pool.query('DELETE FROM notification WHERE near_rib = $1', ['TEST_RIB']);
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

checkNotificationSchema();
