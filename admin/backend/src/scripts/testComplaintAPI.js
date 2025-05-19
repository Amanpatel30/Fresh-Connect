const axios = require('axios');

// Base URL for API requests
const API_URL = 'http://localhost:5003/api/complaints';

// Test all complaint API endpoints
const testComplaintAPI = async () => {
  try {
    console.log('\n----- TESTING COMPLAINT API -----\n');
    
    // Test 1: Get all complaints
    console.log('1. Getting all complaints...');
    const getAllResponse = await axios.get(API_URL);
    console.log(`   Status: ${getAllResponse.status}`);
    console.log(`   Found ${getAllResponse.data.length} complaints`);
    
    // Test 2: Get complaint statistics
    console.log('\n2. Getting complaint statistics...');
    const statsResponse = await axios.get(`${API_URL}/stats/summary`);
    console.log(`   Status: ${statsResponse.status}`);
    console.log('   Statistics:');
    console.log(`   - Total: ${statsResponse.data.total}`);
    console.log(`   - Pending: ${statsResponse.data.pending}`);
    console.log(`   - In Progress: ${statsResponse.data.inProgress}`);
    console.log(`   - Resolved: ${statsResponse.data.resolved}`);
    
    // Test 3: Create a new complaint
    console.log('\n3. Creating a new complaint...');
    const newComplaint = {
      customerName: 'Test User',
      email: 'test.user@example.com',
      subject: 'API Test Complaint',
      description: 'This is a test complaint created via API',
      priority: 'low'
    };
    
    const createResponse = await axios.post(API_URL, newComplaint);
    console.log(`   Status: ${createResponse.status}`);
    console.log(`   Created complaint with ID: ${createResponse.data._id}`);
    
    const newComplaintId = createResponse.data._id;
    
    // Test 4: Get a single complaint by ID
    console.log('\n4. Getting complaint by ID...');
    const getByIdResponse = await axios.get(`${API_URL}/${newComplaintId}`);
    console.log(`   Status: ${getByIdResponse.status}`);
    console.log(`   Subject: ${getByIdResponse.data.subject}`);
    console.log(`   Customer: ${getByIdResponse.data.customerName}`);
    
    // Test 5: Update complaint status
    console.log('\n5. Updating complaint status...');
    const updateResponse = await axios.put(`${API_URL}/${newComplaintId}/status`, {
      status: 'in-progress'
    });
    console.log(`   Status: ${updateResponse.status}`);
    console.log(`   New status: ${updateResponse.data.status}`);
    
    // Test 6: Delete the test complaint
    console.log('\n6. Deleting test complaint...');
    const deleteResponse = await axios.delete(`${API_URL}/${newComplaintId}`);
    console.log(`   Status: ${deleteResponse.status}`);
    console.log(`   Message: ${deleteResponse.data.message}`);
    
    console.log('\n----- ALL API TESTS COMPLETED SUCCESSFULLY -----\n');
    
  } catch (error) {
    console.error('API Test Error:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    console.error('Error Config:', error.config);
  }
};

// Run the tests
testComplaintAPI(); 