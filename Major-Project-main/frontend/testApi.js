// Test script for Urgent Sales API
import axios from 'axios';

// Mock token for testing - replace with a valid token if needed
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2U4M2U2YjQ5Y2Q4ZmU5Mjk3YTc1MyIsImlhdCI6MTY5MzAyMDYxMSwiZXhwIjoxNjk1NjEyNjExfQ.NzhfN8xxWwz8d2_lLXYVmnmJ5hHwIKUUGZQ-ZSOK-n8';

// API URL
const apiUrl = 'http://https://fresh-connect-backend.onrender.com/api/urgent-sales/my-sales';

// Function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testUrgentSalesApi() {
  console.log('Testing Urgent Sales API...');
  console.log('API URL:', apiUrl);
  console.log('Using token:', token.substring(0, 15) + '...');
  
  // Wait for backend to be fully started
  console.log('Waiting 2 seconds for backend server to be fully started...');
  await delay(2000);
  
  try {
    console.log('Making API request...');
    
    // Make the request with axios
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-User-Role': 'hotel'
      },
      timeout: 5001 // Add a timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    console.log('Number of urgent sales found:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('First urgent sale:', response.data[0]);
    } else {
      console.log('No urgent sales found.');
    }
  } catch (error) {
    console.error('Error testing API:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error data:', error.response.data);
      console.error('Response error status:', error.response.status);
      console.error('Response error headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. The server might not be running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    // Try to fetch the public endpoint to check if the server is running
    try {
      console.log('\nTrying public endpoint to check if server is running...');
      const publicResponse = await axios.get('http://https://fresh-connect-backend.onrender.com/api/test');
      console.log('Public endpoint response:', publicResponse.data);
      console.log('Server is running but the urgent sales endpoint has an issue');
    } catch (err) {
      console.error('Public endpoint also failed. Server might not be running at all.');
    }
  }
}

// Run the test
testUrgentSalesApi(); 