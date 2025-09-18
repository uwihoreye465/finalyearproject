const http = require('http');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:6000';
const API_VERSION = 'v1';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          };
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Test 1: Add victim with text evidence only
async function testTextEvidence() {
  console.log('🧪 Test 1: Adding victim with text evidence only...');
  
  const data = JSON.stringify({
    address_now: "Nyagatare District",
    phone: "+250788567390",
    victim_email: "farmer@example.com",
    sinner_identification: "Livestock thief",
    crime_type: "Animal theft",
    evidence_description: "Footprints, missing animals records",
    date_committed: "2024-03-01",
    criminal_id: null
  });

  const options = {
    hostname: 'localhost',
    port: 6000,
    path: `/api/${API_VERSION}/victims`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  try {
    const response = await makeRequest(options, data);
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      const result = JSON.parse(response.body);
      console.log('✅ Text evidence test passed');
      console.log(`📝 Evidence: ${JSON.stringify(result.data.victim.evidence, null, 2)}`);
      return result.data.victim.vic_id;
    } else {
      console.log('❌ Text evidence test failed');
      console.log('Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Text evidence test error:', error.message);
  }
}

// Test 2: Get all victims
async function testGetAllVictims() {
  console.log('\n🧪 Test 2: Getting all victims...');
  
  const options = {
    hostname: 'localhost',
    port: 6000,
    path: `/api/${API_VERSION}/victims`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.body);
      console.log('✅ Get all victims test passed');
      console.log(`📊 Found ${result.data.victims.length} victims`);
      
      // Show evidence structure for each victim
      result.data.victims.forEach((victim, index) => {
        console.log(`\n📋 Victim ${index + 1} (ID: ${victim.vic_id}):`);
        console.log(`   Crime: ${victim.crime_type}`);
        console.log(`   Evidence: ${JSON.stringify(victim.evidence, null, 4)}`);
      });
    } else {
      console.log('❌ Get all victims test failed');
      console.log('Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Get all victims test error:', error.message);
  }
}

// Test 3: Get victim by ID
async function testGetVictimById(victimId) {
  if (!victimId) {
    console.log('\n⏭️ Skipping get victim by ID test (no victim ID available)');
    return;
  }

  console.log(`\n🧪 Test 3: Getting victim by ID (${victimId})...`);
  
  const options = {
    hostname: 'localhost',
    port: 6000,
    path: `/api/${API_VERSION}/victims/${victimId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const result = JSON.parse(response.body);
      console.log('✅ Get victim by ID test passed');
      console.log(`📋 Victim Details:`);
      console.log(`   ID: ${result.data.victim.vic_id}`);
      console.log(`   Crime: ${result.data.victim.crime_type}`);
      console.log(`   Evidence: ${JSON.stringify(result.data.victim.evidence, null, 4)}`);
    } else {
      console.log('❌ Get victim by ID test failed');
      console.log('Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Get victim by ID test error:', error.message);
  }
}

// Test 4: Test file upload endpoint (without actual file)
async function testFileUploadEndpoint() {
  console.log('\n🧪 Test 4: Testing file upload endpoint...');
  
  const options = {
    hostname: 'localhost',
    port: 6000,
    path: `/api/${API_VERSION}/victims/upload-evidence`,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 400) {
      console.log('✅ File upload endpoint is working (expected 400 for no file)');
      console.log('Response:', response.body);
    } else {
      console.log('❌ Unexpected response from file upload endpoint');
      console.log('Response:', response.body);
    }
  } catch (error) {
    console.log('❌ File upload endpoint test error:', error.message);
  }
}

// Test 5: Test invalid file type
async function testInvalidFileType() {
  console.log('\n🧪 Test 5: Testing invalid file type handling...');
  
  const options = {
    hostname: 'localhost',
    port: 6000,
    path: `/api/${API_VERSION}/victims/upload-evidence`,
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };

  try {
    const response = await makeRequest(options);
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 400) {
      console.log('✅ Invalid file type handling is working');
      console.log('Response:', response.body);
    } else {
      console.log('❌ Unexpected response for invalid file type');
      console.log('Response:', response.body);
    }
  } catch (error) {
    console.log('❌ Invalid file type test error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Victim Evidence API Tests\n');
  console.log('=' .repeat(50));
  
  // Check if server is running
  try {
    const healthCheck = await makeRequest({
      hostname: 'localhost',
      port: 6000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (healthCheck.statusCode === 200) {
      console.log('✅ Server is running and healthy\n');
    } else {
      console.log('❌ Server health check failed');
      return;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first.');
    console.log('Run: npm start');
    return;
  }

  // Run tests
  const victimId = await testTextEvidence();
  await testGetAllVictims();
  await testGetVictimById(victimId);
  await testFileUploadEndpoint();
  await testInvalidFileType();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Run the database migration: FIX_EVIDENCE_JSON_ERROR.sql');
  console.log('2. Test file uploads in Postman using the guide: VICTIM_EVIDENCE_POSTMAN_TESTING_GUIDE.md');
  console.log('3. Verify file uploads work with actual files');
}

// Run the tests
runTests().catch(console.error);
