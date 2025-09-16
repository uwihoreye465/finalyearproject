#!/usr/bin/env node

/**
 * Test script for Arrested Criminals API
 * 
 * Usage:
 * 1. Make sure your server is running: npm start
 * 2. Update the credentials below with valid admin credentials
 * 3. Run: node test_arrested_api.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:6000/api/v1';
const TEST_CREDENTIALS = {
    email: 'uwihoreyefrancois12@gmail.com', // Admin email from .env
    password: 'password123'      // Update with your admin password
};

let authToken = '';

// Test data
const testArrestData = {
    fullname: 'Test Criminal Jean Baptiste',
    crime_type: 'Theft',
    date_arrested: '2024-01-15',
    arrest_location: 'Nyamirambo Market, Kigali',
    id_type: 'indangamuntu_yumunyarwanda',
    id_number: '1198780123456789'
    // Removed criminal_record_id to avoid foreign key issues
};

// Helper function to make authenticated requests
const makeRequest = async (method, url, data = null) => {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
};

// Test functions
const authenticate = async () => {
    console.log('🔐 Testing Authentication...');
    const result = await makeRequest('POST', '/auth/login', TEST_CREDENTIALS);
    
    if (result.success && result.data.success) {
        authToken = result.data.data.token;
        console.log('✅ Authentication successful');
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        return true;
    } else {
        console.log('❌ Authentication failed:', result.error);
        return false;
    }
};

const testCreateArrest = async () => {
    console.log('\n📝 Testing Create Arrest Record...');
    const result = await makeRequest('POST', '/arrested', testArrestData);
    
    if (result.success && result.data.success) {
        console.log('✅ Arrest record created successfully');
        console.log(`   Arrest ID: ${result.data.data.arrest_id}`);
        console.log(`   Fullname: ${result.data.data.fullname}`);
        console.log(`   Crime Type: ${result.data.data.crime_type}`);
        return result.data.data.arrest_id;
    } else {
        console.log('❌ Create arrest failed:', result.error);
        return null;
    }
};

const testGetAllArrests = async () => {
    console.log('\n📋 Testing Get All Arrests...');
    const result = await makeRequest('GET', '/arrested?page=1&limit=5');
    
    if (result.success && result.data.success) {
        console.log('✅ Retrieved arrests successfully');
        console.log(`   Total records: ${result.data.data.pagination.total}`);
        console.log(`   Records in this page: ${result.data.data.records.length}`);
        
        if (result.data.data.records.length > 0) {
            const firstRecord = result.data.data.records[0];
            console.log(`   First record: ${firstRecord.fullname} - ${firstRecord.crime_type}`);
        }
        return true;
    } else {
        console.log('❌ Get all arrests failed:', result.error);
        return false;
    }
};

const testSearchArrests = async () => {
    console.log('\n🔍 Testing Search Arrests...');
    const result = await makeRequest('GET', '/arrested?search=theft&limit=3');
    
    if (result.success && result.data.success) {
        console.log('✅ Search completed successfully');
        console.log(`   Found ${result.data.data.records.length} records matching "theft"`);
        return true;
    } else {
        console.log('❌ Search arrests failed:', result.error);
        return false;
    }
};

const testGetArrestById = async (arrestId) => {
    if (!arrestId) return false;
    
    console.log(`\n🔍 Testing Get Arrest by ID (${arrestId})...`);
    const result = await makeRequest('GET', `/arrested/${arrestId}`);
    
    if (result.success && result.data.success) {
        console.log('✅ Retrieved arrest by ID successfully');
        console.log(`   Fullname: ${result.data.data.fullname}`);
        console.log(`   Crime Type: ${result.data.data.crime_type}`);
        console.log(`   Date Arrested: ${result.data.data.date_arrested}`);
        return true;
    } else {
        console.log('❌ Get arrest by ID failed:', result.error);
        return false;
    }
};

const testUpdateArrest = async (arrestId) => {
    if (!arrestId) return false;
    
    console.log(`\n✏️ Testing Update Arrest (${arrestId})...`);
    const updateData = {
        crime_type: 'Armed Robbery',
        arrest_location: 'Updated Location - Kigali City Center'
    };
    
    const result = await makeRequest('PUT', `/arrested/${arrestId}`, updateData);
    
    if (result.success && result.data.success) {
        console.log('✅ Arrest record updated successfully');
        console.log(`   Updated Crime Type: ${result.data.data.crime_type}`);
        console.log(`   Updated Location: ${result.data.data.arrest_location}`);
        return true;
    } else {
        console.log('❌ Update arrest failed:', result.error);
        return false;
    }
};

const testGetStatistics = async () => {
    console.log('\n📊 Testing Get Statistics...');
    const result = await makeRequest('GET', '/arrested/statistics');
    
    if (result.success && result.data.success) {
        console.log('✅ Statistics retrieved successfully');
        const stats = result.data.data;
        console.log(`   Total Arrests: ${stats.totalArrests}`);
        console.log(`   This Month: ${stats.thisMonthArrests}`);
        console.log(`   This Year: ${stats.thisYearArrests}`);
        console.log(`   Crime Types: ${Object.keys(stats.crimeTypeDistribution || {}).length} different types`);
        console.log(`   Recent Arrests: ${stats.recentArrests?.length || 0} in last 7 days`);
        return true;
    } else {
        console.log('❌ Get statistics failed:', result.error);
        return false;
    }
};

const testDeleteArrest = async (arrestId) => {
    if (!arrestId) return false;
    
    console.log(`\n🗑️ Testing Delete Arrest (${arrestId})...`);
    const result = await makeRequest('DELETE', `/arrested/${arrestId}`);
    
    if (result.success && result.data.success) {
        console.log('✅ Arrest record deleted successfully');
        return true;
    } else {
        console.log('❌ Delete arrest failed:', result.error);
        return false;
    }
};

// Main test runner
const runTests = async () => {
    console.log('🚀 Starting Arrested API Tests...\n');
    console.log('='.repeat(50));
    
    // Step 1: Authenticate
    const authSuccess = await authenticate();
    if (!authSuccess) {
        console.log('\n❌ Cannot continue without authentication. Please check your credentials.');
        return;
    }
    
    let createdArrestId = null;
    
    try {
        // Step 2: Test basic operations
        await testGetAllArrests();
        await testSearchArrests();
        await testGetStatistics();
        
        // Step 3: Test CRUD operations
        createdArrestId = await testCreateArrest();
        
        if (createdArrestId) {
            await testGetArrestById(createdArrestId);
            await testUpdateArrest(createdArrestId);
            
            // Optional: Delete the test record (uncomment if you want to clean up)
            // await testDeleteArrest(createdArrestId);
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 All tests completed!');
        
        if (createdArrestId) {
            console.log(`\n📝 Note: Test record with ID ${createdArrestId} was created.`);
            console.log('   You may want to delete it manually if needed.');
        }
        
    } catch (error) {
        console.log('\n❌ Test execution error:', error.message);
    }
};

// Error handling for missing dependencies
const checkDependencies = () => {
    try {
        require('axios');
        return true;
    } catch (error) {
        console.log('❌ Missing dependency: axios');
        console.log('   Please install it with: npm install axios');
        return false;
    }
};

// Run tests if dependencies are available
if (checkDependencies()) {
    runTests().catch(console.error);
}
