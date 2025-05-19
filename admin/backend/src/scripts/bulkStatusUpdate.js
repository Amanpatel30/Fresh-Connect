const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection URI from environment variables
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/major-project';

// Function to fix all users' status fields
async function bulkStatusFix() {
  console.log('BULK STATUS FIX SCRIPT');
  console.log(`MongoDB URI: ${uri}`);
  
  // Create a new MongoClient
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB server');
    
    // Get the database and collection
    const database = client.db();
    const collection = database.collection('users');
    
    // Count users with inconsistencies
    const inconsistentUsers = await collection.find({
      $or: [
        // Missing status field
        { status: { $exists: false } },
        // Missing isActive field
        { isActive: { $exists: false } },
        // Inconsistent values (active status but inactive flag, etc.)
        { status: 'Active', isActive: false },
        { status: 'Inactive', isActive: true },
        { status: 'Suspended', isActive: true }
      ]
    }).toArray();
    
    console.log(`Found ${inconsistentUsers.length} users with inconsistent status fields`);
    
    // Log the inconsistent users
    inconsistentUsers.forEach(user => {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  Status: ${user.status || 'undefined'}`);
      console.log(`  isActive: ${user.isActive !== undefined ? user.isActive : 'undefined'}`);
    });
    
    // Fix each user
    let fixedCount = 0;
    
    // Fix users missing status
    const missingStatusResult = await collection.updateMany(
      { status: { $exists: false }, isActive: { $exists: true } },
      { $set: { status: { $cond: { if: '$isActive', then: 'Active', else: 'Inactive' } } } }
    );
    
    console.log(`Fixed ${missingStatusResult.modifiedCount} users missing status field`);
    fixedCount += missingStatusResult.modifiedCount;
    
    // Fix users missing isActive
    const missingActiveResult = await collection.updateMany(
      { isActive: { $exists: false }, status: { $exists: true } },
      { $set: { isActive: { $eq: ['$status', 'Active'] } } }
    );
    
    console.log(`Fixed ${missingActiveResult.modifiedCount} users missing isActive field`);
    fixedCount += missingActiveResult.modifiedCount;
    
    // Fix inconsistent status: Active but isActive false
    const inconsistentActiveResult = await collection.updateMany(
      { status: 'Active', isActive: false },
      { $set: { isActive: true } }
    );
    
    console.log(`Fixed ${inconsistentActiveResult.modifiedCount} users with Active status but inactive flag`);
    fixedCount += inconsistentActiveResult.modifiedCount;
    
    // Fix inconsistent status: Inactive/Suspended but isActive true
    const inconsistentInactiveResult = await collection.updateMany(
      { status: { $in: ['Inactive', 'Suspended'] }, isActive: true },
      { $set: { isActive: false } }
    );
    
    console.log(`Fixed ${inconsistentInactiveResult.modifiedCount} users with Inactive/Suspended status but active flag`);
    fixedCount += inconsistentInactiveResult.modifiedCount;
    
    // Set default status for users without any status info
    const defaultStatusResult = await collection.updateMany(
      { status: { $exists: false }, isActive: { $exists: false } },
      { $set: { status: 'Active', isActive: true } }
    );
    
    console.log(`Set default status for ${defaultStatusResult.modifiedCount} users without any status info`);
    fixedCount += defaultStatusResult.modifiedCount;
    
    console.log(`Fixed ${fixedCount} users in total`);
    
    // Count users of each status after fixes
    const activeCount = await collection.countDocuments({ status: 'Active' });
    const inactiveCount = await collection.countDocuments({ status: 'Inactive' });
    const suspendedCount = await collection.countDocuments({ status: 'Suspended' });
    
    console.log('Status counts after fixes:');
    console.log(`  Active: ${activeCount}`);
    console.log(`  Inactive: ${inactiveCount}`);
    console.log(`  Suspended: ${suspendedCount}`);
    
  } catch (error) {
    console.error('Error fixing user statuses:', error);
  } finally {
    // Close the client connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
bulkStatusFix(); 