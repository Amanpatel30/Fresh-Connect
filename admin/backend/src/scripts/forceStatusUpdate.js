const { MongoClient } = require('mongodb');
require('dotenv').config();

// Ensure we have command line arguments
if (process.argv.length < 4) {
  console.error('Usage: node forceStatusUpdate.js <userId> <status>');
  process.exit(1);
}

// Get user ID and status from command line
const userId = process.argv[2];
const status = process.argv[3];

// Validate status
if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
  console.error('Status must be Active, Inactive, or Suspended');
  process.exit(1);
}

// MongoDB connection URI
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/major-project';

async function forceStatusUpdate() {
  console.log(`⚡ FORCE STATUS UPDATE SCRIPT ⚡`);
  console.log(`User ID: ${userId}`);
  console.log(`New Status: ${status}`);
  console.log(`MongoDB URI: ${uri}`);

  // MongoDB client
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Connected to MongoDB');

    // Get database and users collection
    const db = client.db();
    const users = db.collection('users');

    // Create ObjectId from string
    const { ObjectId } = require('mongodb');
    const objectId = new ObjectId(userId);

    // Get user before update
    const user = await users.findOne({ _id: objectId });
    
    if (!user) {
      console.error(`❌ User with ID ${userId} not found!`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current status: ${user.status || 'undefined'}`);
    console.log(`Current isActive: ${user.isActive !== undefined ? user.isActive : 'undefined'}`);

    // Determine isActive value based on status
    const isActive = status === 'Active';

    // Force update with direct MongoDB commands
    const result = await users.updateOne(
      { _id: objectId },
      { 
        $set: { 
          status: status,
          isActive: isActive,
          updatedAt: new Date()
        } 
      },
      { bypassDocumentValidation: true }
    );

    console.log('Update result:', JSON.stringify(result));

    // Verify update was successful by retrieving the updated document
    const updatedUser = await users.findOne({ _id: objectId });
    
    console.log('\nAfter update:');
    console.log(`Status: ${updatedUser.status}`);
    console.log(`isActive: ${updatedUser.isActive}`);

    if (updatedUser.status === status && updatedUser.isActive === isActive) {
      console.log('✅ Status update SUCCESSFUL!');
    } else {
      console.log('❌ Status update FAILED!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
forceStatusUpdate(); 