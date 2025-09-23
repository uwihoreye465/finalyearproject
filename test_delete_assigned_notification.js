// Test script for delete assigned notification API
const axios = require('axios');

const BASE_URL = 'https://tracking-criminal.onrender.com/api/v1';

async function testDeleteAssignedNotification() {
  console.log('🧪 Testing Delete Assigned Notification API...\n');

  try {
    // First, let's get all notifications to see which ones are assigned
    console.log('📋 Getting all notifications to check assignments...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`);
    
    if (notificationsResponse.data.success) {
      const notifications = notificationsResponse.data.data.notifications;
      console.log('📊 Total notifications:', notifications.length);
      
      // Find notifications with assigned_user_id
      const assignedNotifications = notifications.filter(n => n.assigned_user_id !== null);
      console.log('👤 Assigned notifications:', assignedNotifications.length);
      
      if (assignedNotifications.length > 0) {
        const testNotification = assignedNotifications[0];
        console.log('🎯 Testing with notification:', {
          id: testNotification.not_id,
          assigned_to: testNotification.assigned_user_id,
          fullname: testNotification.fullname,
          message: testNotification.message
        });

        // Test delete (this will fail without proper auth token)
        console.log('\n🗑️ Testing delete assigned notification...');
        console.log(`DELETE ${BASE_URL}/notifications/assigned/${testNotification.not_id}`);
        console.log('Note: This requires a valid JWT token in Authorization header');
        
        // Example of how to test with proper token:
        console.log('\n📝 Example test with token:');
        console.log(`curl -X DELETE "${BASE_URL}/notifications/assigned/${testNotification.not_id}" \\`);
        console.log(`  -H "Authorization: Bearer YOUR_JWT_TOKEN"`);
        
      } else {
        console.log('⚠️ No assigned notifications found to test with');
        console.log('💡 You may need to assign notifications first using:');
        console.log(`POST ${BASE_URL}/notifications/assign-all`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDeleteAssignedNotification();
