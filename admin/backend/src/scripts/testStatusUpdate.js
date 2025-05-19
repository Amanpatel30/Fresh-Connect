const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const User = require('../models/User');

// Connection URI
const uri = process.env.MONGO_URI;
console.log('Using connection string:', uri);

// Create a very direct test that updates status without using the model
async function testStatusUpdate() {
  try {
    // Connect to MongoDB directly
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully!');
    
    // Find a user to update (Sarah)
    const testUser = await User.findOne({ email: 'sarah@seller.com' });
    
    if (!testUser) {
      console.log('Test user not found');
      return;
    }
    
    console.log('Found test user:', testUser.name);
    console.log('Current status:', testUser.status);
    console.log('Current isActive:', testUser.isActive);
    
    // Toggle the status
    const newStatus = testUser.status === 'Active' ? 'Inactive' : 'Active';
    const newIsActive = newStatus === 'Active';
    
    console.log(`Setting status to ${newStatus} and isActive to ${newIsActive}`);
    
    // Use updateOne to bypass schema validation and hooks
    const result = await mongoose.connection.db.collection('users').updateOne(
      { _id: testUser._id },
      { $set: { status: newStatus, isActive: newIsActive } }
    );
    
    console.log('Direct MongoDB update result:', result);
    
    // Verify the update worked
    const updatedUser = await User.findById(testUser._id);
    console.log('After update:');
    console.log('New status:', updatedUser.status);
    console.log('New isActive:', updatedUser.isActive);
    
    console.log('Status update test complete!');
  } catch (error) {
    console.error('Error testing status update:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed gracefully');
  }
}

// Run the function
testStatusUpdate(); 