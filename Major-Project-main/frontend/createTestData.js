// Test script to create sample urgent sales data
import axios from 'axios';

// Mock token for testing - known to work
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Y2U4M2U2YjQ5Y2Q4ZmU5Mjk3YTc1MyIsImlhdCI6MTY5MzAyMDYxMSwiZXhwIjoxNjk1NjEyNjExfQ.NzhfN8xxWwz8d2_lLXYVmnmJ5hHwIKUUGZQ-ZSOK-n8';

// API URL
const API_BASE_URL = 'http://localhost:5001';

// Function to create a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Sample urgent sales - with direct data
const sampleUrgentSales = [
  {
    name: 'Butter Chicken',
    originalPrice: 350,
    discountedPrice: 245,
    stock: 15,
    unit: 'plate',
    description: 'Tender chicken in a creamy tomato sauce - limited time offer!',
    image: 'https://via.placeholder.com/300x180?text=Butter+Chicken',
    isActive: true
  },
  {
    name: 'Paneer Tikka',
    originalPrice: 280,
    discountedPrice: 196,
    stock: 20,
    unit: 'plate',
    description: 'Chunks of paneer marinated and grilled - save 30% today only!',
    image: 'https://via.placeholder.com/300x180?text=Paneer+Tikka',
    isActive: true
  },
  {
    name: 'Vegetable Biryani',
    originalPrice: 240,
    discountedPrice: 168,
    stock: 18,
    unit: 'plate',
    description: 'Fragrant rice dish with mixed vegetables - hurry before it\'s gone!',
    image: 'https://via.placeholder.com/300x180?text=Veg+Biryani',
    isActive: true
  }
];

// Create urgent sales
async function createUrgentSales() {
  console.log('Creating urgent sales directly...');
  
  const url = `${API_BASE_URL}/api/urgent-sales/direct`;
  console.log('Urgent sales API URL:', url);
  
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-User-Role': 'hotel'
    }
  };
  
  // Create an expiry date 24 hours from now
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 24);
  
  for (const item of sampleUrgentSales) {
    // Add expiry date to each item
    const saleData = {
      ...item,
      expiryDate
    };
    
    try {
      console.log(`Creating urgent sale for ${item.name}`);
      const response = await axios.post(url, saleData, config);
      console.log(`Urgent sale created with ID: ${response.data._id}`);
    } catch (error) {
      console.error(`Failed to create urgent sale for ${item.name}:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
    
    // Add a small delay between requests
    await delay(500);
  }
}

// Check urgent sales
async function checkUrgentSales() {
  try {
    console.log('Checking existing urgent sales...');
    
    const url = `${API_BASE_URL}/api/urgent-sales/my-sales`;
    console.log('My urgent sales API URL:', url);
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-User-Role': 'hotel'
      }
    };
    
    const response = await axios.get(url, config);
    console.log(`Found ${response.data.length} urgent sales`);
    
    if (response.data.length > 0) {
      console.log('First urgent sale:', response.data[0]);
    }
    
    return response.data.length;
  } catch (error) {
    console.error('Error checking urgent sales:', error.message);
    return 0;
  }
}

// Main function
async function populateTestData() {
  try {
    // First check if we already have urgent sales
    const existingSales = await checkUrgentSales();
    
    if (existingSales > 0) {
      console.log(`Found ${existingSales} existing urgent sales. No need to create more.`);
    } else {
      // Create urgent sales directly
      await createUrgentSales();
      
      // Check again after creating
      await checkUrgentSales();
    }
    
    console.log('Test data population completed');
  } catch (error) {
    console.error('Error populating test data:', error);
  }
}

// Run the function
populateTestData(); 