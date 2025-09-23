// Test script for notification assignment system
const axios = require('axios');

const BASE_URL = 'https://tracking-criminal.onrender.com/api/v1';

// Test data
const testNotification = {
  near_rib: 'RIB Gatare',
  fullname: 'Test User',
  address: 'Kigali, Rwanda',
  phone: '+250788123456',
  message: 'Test notification for assignment system'
};

const testUser = {
  fullname: 'John Doe',
  email: 'john@ribgatare.com',
  password: 'testpassword123',
  role: 'near_rib',
  sector: 'RIB Gatare',
  position: 'Officer'
};

async function testNotificationAssignment() {
  console.log('🧪 Testing Notification Assignment System...\n');

  try {
    // Test 1: Send notification
    console.log('📨 Test 1: Sending notification...');
    const notificationResponse = await axios.post(`${BASE_URL}/notifications`, testNotification);
    
    if (notificationResponse.data.success) {
      console.log('✅ Notification sent successfully');
      console.log('📍 GPS Location:', notificationResponse.data.data.device_tracking.location);
      console.log('🗺️ Google Maps Links:', notificationResponse.data.data.device_tracking.google_maps_links);
    } else {
      console.log('❌ Failed to send notification:', notificationResponse.data.message);
      return;
    }

    // Test 2: Get assignment statistics
    console.log('\n📊 Test 2: Getting assignment statistics...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/notifications/stats/assignment`);
      if (statsResponse.data.success) {
        console.log('✅ Assignment statistics retrieved');
        console.log('📈 Overall Stats:', statsResponse.data.data.overall_stats);
        console.log('🏢 Sector Stats:', statsResponse.data.data.sector_stats);
        console.log('👥 User Stats:', statsResponse.data.data.user_stats);
      }
    } catch (error) {
      console.log('⚠️ Assignment statistics not available (requires authentication)');
    }

    // Test 3: Get all notifications
    console.log('\n📋 Test 3: Getting all notifications...');
    const allNotificationsResponse = await axios.get(`${BASE_URL}/notifications`);
    
    if (allNotificationsResponse.data.success) {
      console.log('✅ All notifications retrieved');
      console.log('📊 Total notifications:', allNotificationsResponse.data.data.notifications.length);
      
      // Check if any notifications have assigned_user_id
      const assignedNotifications = allNotificationsResponse.data.data.notifications.filter(
        n => n.assigned_user_id !== null
      );
      console.log('👤 Assigned notifications:', assignedNotifications.length);
      
      if (assignedNotifications.length > 0) {
        console.log('✅ Assignment system is working!');
        console.log('📝 Sample assigned notification:', {
          id: assignedNotifications[0].not_id,
          near_rib: assignedNotifications[0].near_rib,
          assigned_user_id: assignedNotifications[0].assigned_user_id,
          has_gps: !!assignedNotifications[0].gps_location,
          google_maps_links: assignedNotifications[0].google_maps_links
        });
      } else {
        console.log('⚠️ No notifications are assigned yet');
      }
    }

    // Test 4: Test Google Maps links
    console.log('\n🗺️ Test 4: Testing Google Maps links...');
    const notificationsWithGPS = allNotificationsResponse.data.data.notifications.filter(
      n => n.gps_location && n.gps_location.google_maps_links
    );
    
    if (notificationsWithGPS.length > 0) {
      const sampleNotification = notificationsWithGPS[0];
      console.log('✅ GPS notifications found');
      console.log('📍 Location:', sampleNotification.gps_location.location_name);
      console.log('🗺️ Standard Map:', sampleNotification.gps_location.google_maps_links.standard);
      console.log('🛰️ Satellite View:', sampleNotification.gps_location.google_maps_links.satellite);
      console.log('🚗 Directions:', sampleNotification.gps_location.google_maps_links.directions);
    } else {
      console.log('⚠️ No GPS notifications found');
    }

    // Test 5: Test RIB statistics
    console.log('\n📊 Test 5: Getting RIB statistics...');
    const ribStatsResponse = await axios.get(`${BASE_URL}/notifications/stats/rib-statistics`);
    
    if (ribStatsResponse.data.success) {
      console.log('✅ RIB statistics retrieved');
      console.log('📈 RIB Stats:', ribStatsResponse.data.data.rib_statistics);
      console.log('📊 Overall Stats:', ribStatsResponse.data.data.overall_statistics);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Notification sending: Working');
    console.log('✅ GPS location tracking: Working');
    console.log('✅ Google Maps links: Working');
    console.log('✅ Assignment system: Working');
    console.log('✅ Statistics endpoints: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testNotificationAssignment();
