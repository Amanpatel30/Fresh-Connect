// Test credentials
const testCredentials = {
  email: 'hotel1@example.com',
  password: 'password123'
};

// Function to test login
async function testLogin() {
  try {
    console.log('Testing login with credentials:', testCredentials);
    
    const response = await fetch('http://https://fresh-connect-backend.onrender.com/api/hotels/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });
    
    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server responded with status ${response.status}: ${errorData.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    console.log('Login successful!');
    console.log('Response data:', data);
    console.log('Token:', data.token);
    
    return data;
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', error.message);
    
    throw error;
  }
}

// Run the test
testLogin()
  .then(data => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed');
    process.exit(1);
  }); 