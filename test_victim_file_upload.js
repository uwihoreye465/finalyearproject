const https = require('https');
const fs = require('fs');
const path = require('path');

// Test victim evidence file upload
async function testVictimFileUpload() {
  console.log('🧪 Testing Victim Evidence File Upload');
  console.log('🌐 Server: http://localhost:6000');
  
  // Create a test file
  const testFilePath = path.join(__dirname, 'test_evidence.txt');
  const testContent = 'This is a test evidence file for victim record.';
  fs.writeFileSync(testFilePath, testContent);
  
  try {
    console.log('\n📁 Created test file:', testFilePath);
    
    // Read the test file
    const fileData = fs.readFileSync(testFilePath);
    
    // Create multipart form data
    const boundary = '----formdata-test-boundary';
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="evidence"; filename="test_evidence.txt"',
      'Content-Type: text/plain',
      '',
      testContent,
      `--${boundary}--`
    ].join('\r\n');
    
    const options = {
      hostname: 'localhost',
      port: 6000,
      path: '/api/v1/victims/upload-evidence',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData),
        'Authorization': 'Bearer test-token' // You'll need a real token
      }
    };
    
    console.log('\n📡 Sending file upload request...');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n✅ Upload Response:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('\n🎉 SUCCESS: File upload working!');
            console.log(`📁 File URL: ${response.data.fileUrl}`);
          } else {
            console.log('\n❌ Upload failed:', response.message);
          }
        } catch (parseError) {
          console.log('\n❌ Failed to parse response:', parseError.message);
          console.log('Raw response:', data);
        }
        
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
          console.log('\n🧹 Cleaned up test file');
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('\n❌ Request failed:', error.message);
      
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log('\n🧹 Cleaned up test file');
      }
    });
    
    req.write(formData);
    req.end();
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n🧹 Cleaned up test file');
    }
  }
}

// Test creating victim record with evidence
async function testCreateVictimWithEvidence() {
  console.log('\n🧪 Testing Create Victim with Evidence Files');
  
  // Create a test file
  const testFilePath = path.join(__dirname, 'test_evidence.txt');
  const testContent = 'This is evidence for the victim record.';
  fs.writeFileSync(testFilePath, testContent);
  
  try {
    const fileData = fs.readFileSync(testFilePath);
    
    // Create multipart form data for victim creation
    const boundary = '----formdata-victim-boundary';
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="id_type"',
      '',
      'indangamuntu_yumunyarwanda',
      `--${boundary}`,
      'Content-Disposition: form-data; name="id_number"',
      '',
      '1190000000000001',
      `--${boundary}`,
      'Content-Disposition: form-data; name="address_now"',
      '',
      'Kigali, Rwanda',
      `--${boundary}`,
      'Content-Disposition: form-data; name="phone"',
      '',
      '+250788123456',
      `--${boundary}`,
      'Content-Disposition: form-data; name="sinner_identification"',
      '',
      'John Doe',
      `--${boundary}`,
      'Content-Disposition: form-data; name="crime_type"',
      '',
      'Theft',
      `--${boundary}`,
      'Content-Disposition: form-data; name="evidence_description"',
      '',
      'Stolen items evidence',
      `--${boundary}`,
      'Content-Disposition: form-data; name="date_committed"',
      '',
      '2024-01-01',
      `--${boundary}`,
      'Content-Disposition: form-data; name="evidence"; filename="test_evidence.txt"',
      'Content-Type: text/plain',
      '',
      testContent,
      `--${boundary}--`
    ].join('\r\n');
    
    const options = {
      hostname: 'localhost',
      port: 6000,
      path: '/api/v1/victims',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData),
        'Authorization': 'Bearer test-token' // You'll need a real token
      }
    };
    
    console.log('\n📡 Sending victim creation request with evidence...');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n✅ Victim Creation Response:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('\n🎉 SUCCESS: Victim created with evidence!');
            console.log(`📁 Evidence files: ${response.data.evidence.totalFiles}`);
          } else {
            console.log('\n❌ Victim creation failed:', response.message);
          }
        } catch (parseError) {
          console.log('\n❌ Failed to parse response:', parseError.message);
          console.log('Raw response:', data);
        }
        
        // Clean up test file
        if (fs.existsSync(testFilePath)) {
          fs.unlinkSync(testFilePath);
          console.log('\n🧹 Cleaned up test file');
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('\n❌ Request failed:', error.message);
      
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log('\n🧹 Cleaned up test file');
      }
    });
    
    req.write(formData);
    req.end();
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('\n🧹 Cleaned up test file');
    }
  }
}

// Run tests
console.log('🚀 Starting Victim File Upload Tests...');
console.log('⚠️  Note: Make sure your server is running on port 6000');
console.log('⚠️  Note: You need a valid authentication token');

testVictimFileUpload();
setTimeout(() => testCreateVictimWithEvidence(), 2000);
