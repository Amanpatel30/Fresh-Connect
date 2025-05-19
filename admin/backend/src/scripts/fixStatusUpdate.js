const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB URI from environment variables
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/major-project';

// Get userId and status from command line args
const userId = process.argv[2]; // or a default ID
const status = process.argv[3] || 'Active';

async function testStatusUpdate() {
  console.log('STATUS UPDATE TEST');
  console.log(`MongoDB URI: ${uri}`);
  console.log(`Testing update for user ${userId} to status ${status}`);
  
  try {
    // First connect to MongoDB to verify the user exists
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Convert the ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);
    
    // Get the current user status
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ _id: objectId });
    
    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return;
    }
    
    console.log('Current user details:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Status: ${user.status || 'undefined'}`);
    console.log(`  isActive: ${user.isActive !== undefined ? user.isActive : 'undefined'}`);
    
    // Now test both API methods
    
    // 1. Test the controller update method directly
    console.log('\nDirect MongoDB update:');
    const isActive = status === 'Active';
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { status, isActive } }
    );
    
    console.log('MongoDB update result:', result);
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ _id: objectId });
    console.log('User after direct update:');
    console.log(`  Status: ${updatedUser.status}`);
    console.log(`  isActive: ${updatedUser.isActive}`);
    
    console.log('\nStatus update test completed successfully');
  } catch (error) {
    console.error('Error in status update test:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testStatusUpdate(); 