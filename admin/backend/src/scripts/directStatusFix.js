const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Connection URI from environment variables
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/major-project';
const userId = process.argv[2]; // Get user ID from command line
const newStatus = process.argv[3] || 'Inactive'; // Get status from command line or default to Inactive

// Function to directly connect to MongoDB and update a document
async function directUpdateStatus() {
  console.log(`DIRECT STATUS UPDATE SCRIPT`);
  console.log(`User ID: ${userId}`);
  console.log(`New Status: ${newStatus}`);
  console.log(`MongoDB URI: ${uri}`);
  
  if (!userId) {
    console.error('ERROR: No user ID provided. Usage: node directStatusFix.js [userId] [status]');
    process.exit(1);
  }
  
  // Create a new MongoClient
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB server');
    
    // Get the database and collection
    const database = client.db();
    const collection = database.collection('users');
    
    // Find the user before update to check current status
    const userBefore = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (!userBefore) {
      console.error(`User with ID ${userId} not found in database`);
      return;
    }
    
    console.log('Found user:', userBefore.name);
    console.log('Current status:', userBefore.status);
    console.log('Current isActive:', userBefore.isActive);
    
    // Determine the isActive value based on newStatus
    const isActive = newStatus === 'Active';
    
    // Perform the update with $set
    const result = await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          status: newStatus,
          isActive: isActive 
        } 
      }
    );
    
    console.log(`Update result: ${JSON.stringify(result)}`);
    
    if (result.matchedCount === 0) {
      console.error(`No user matched the ID ${userId}`);
    } else if (result.modifiedCount === 0) {
      console.log(`User found but no changes made - values were already set`);
    } else {
      console.log(`User updated successfully! Modified ${result.modifiedCount} document(s)`);
    }
    
    // Verify the update by fetching the user again
    const userAfter = await collection.findOne({ _id: new ObjectId(userId) });
    console.log('After update:');
    console.log('Status:', userAfter.status);
    console.log('isActive:', userAfter.isActive);
    
  } catch (error) {
    console.error('Error updating user status:', error);
  } finally {
    // Close the client connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
directUpdateStatus(); 