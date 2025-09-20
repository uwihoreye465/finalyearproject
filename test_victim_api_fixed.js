const axios = require('axios');

const BASE_URL = 'http://localhost:6000/api/v1';

// Test data
const testVictim = {
  id_type: "passport",
  id_number: "TEST123456789",
  address_now: "Test District",
  phone: "+250788123456",
  victim_email: "test@example.com",
  sinner_identification: "Test criminal",
  crime_type: "Test crime",
  evidence: {
    description: "Test evidence description",
    files: [],
    uploadedAt: "2024-01-01T12:00:00.000Z"
  },
  date_committed: "2024-01-01"
};

const testUpdate = {
  address_now: "Updated Test District",
  phone: "+250788999999",
  victim_email: "updated@example.com",
  sinner_identification: "Updated criminal description",
  crime_type: "Updated crime type"
};

async function testVictimAPI() {
  console.log('🧪 Testing Victim API...\n');

  try {
    // Test 1: Create Victim
    console.log('1️⃣ Testing POST /api/v1/victims...');
    const createResponse = await axios.post(`${BASE_URL}/victims`, testVictim);
    console.log('✅ POST Success:', createResponse.data.message);
    console.log('📊 Victim ID:', createResponse.data.data.victim.vic_id);
    
    const victimId = createResponse.data.data.victim.vic_id;

    // Test 2: Update Victim
    console.log('\n2️⃣ Testing PUT /api/v1/victims/:id...');
    const updateResponse = await axios.put(`${BASE_URL}/victims/${victimId}`, testUpdate);
    console.log('✅ PUT Success:', updateResponse.data.message);

    // Test 3: Get Victim
    console.log('\n3️⃣ Testing GET /api/v1/victims/:id...');
    const getResponse = await axios.get(`${BASE_URL}/victims/${victimId}`);
    console.log('✅ GET Success:', getResponse.data.message);
    console.log('📊 Updated Address:', getResponse.data.data.victim.address_now);

    // Test 4: Get All Victims
    console.log('\n4️⃣ Testing GET /api/v1/victims...');
    const getAllResponse = await axios.get(`${BASE_URL}/victims`);
    console.log('✅ GET All Success:', getAllResponse.data.message);
    console.log('📊 Total Victims:', getAllResponse.data.data.victims.length);

    console.log('\n🎉 All Victim API tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('📊 Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testVictimAPI();
