// Test script to verify GPS coordinate validation fix
const axios = require('axios');

const BASE_URL = 'https://tracking-criminal.onrender.com/api/v1';

async function testGPSFix() {
  console.log('🧪 Testing GPS coordinate validation fix...\n');

  try {
    // Test notification with GPS data
    const testNotification = {
      near_rib: 'RIB Gatare',
      fullname: 'Test User',
      address: 'Kigali, Rwanda',
      phone: '+250788123456',
      message: 'Testing GPS coordinate validation fix'
    };

    console.log('📨 Sending test notification...');
    const response = await axios.post(`${BASE_URL}/notifications`, testNotification);
    
    if (response.data.success) {
      console.log('✅ Notification sent successfully!');
      console.log('📍 Location detected:', response.data.data.device_tracking.location_detected);
      console.log('🌍 Location source:', response.data.data.device_tracking.location_source);
      
      if (response.data.data.device_tracking.location) {
        console.log('📍 GPS Coordinates:', {
          latitude: response.data.data.device_tracking.location.latitude,
          longitude: response.data.data.device_tracking.location.longitude,
          location_name: response.data.data.device_tracking.location.location_name
        });
        console.log('🗺️ Google Maps Links:', response.data.data.device_tracking.google_maps_links);
      } else {
        console.log('⚠️ No GPS location data available');
      }
      
      console.log('📝 Note:', response.data.data.device_tracking.note);
    } else {
      console.log('❌ Notification failed:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testGPSFix();
