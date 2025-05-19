const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB URI from environment variables
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/major-project';

async function finalStatusFix() {
  console.log('FINAL STATUS FIX');
  console.log(`MongoDB URI: ${uri}`);
  
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Count and log the total number of users
    const totalUsers = await usersCollection.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);
    
    // Get all users directly from the collection
    console.log('Checking user status fields...');
    const users = await usersCollection.find().toArray();
    
    // Analyze status field distributions
    const statusCount = {
      undefined: 0,
      Active: 0,
      Inactive: 0,
      Suspended: 0
    };
    
    const isActiveCount = {
      undefined: 0,
      true: 0,
      false: 0
    };
    
    // Log current status distributions
    users.forEach(user => {
      // Count status values
      if (!user.status) {
        statusCount.undefined++;
      } else {
        statusCount[user.status] = (statusCount[user.status] || 0) + 1;
      }
      
      // Count isActive values
      if (user.isActive === undefined) {
        isActiveCount.undefined++;
      } else {
        isActiveCount[user.isActive]++;
      }
    });
    
    console.log('Current status distribution:');
    console.log(statusCount);
    console.log('Current isActive distribution:');
    console.log(isActiveCount);
    
    // Find users with inconsistent status and isActive values
    const inconsistentUsers = users.filter(user => {
      // Missing fields
      if (user.status === undefined || user.isActive === undefined) return true;
      
      // Inconsistent values
      if (user.status === 'Active' && user.isActive === false) return true;
      if ((user.status === 'Inactive' || user.status === 'Suspended') && user.isActive === true) return true;
      
      return false;
    });
    
    console.log(`Found ${inconsistentUsers.length} users with inconsistent status fields`);
    
    // Log inconsistent users
    inconsistentUsers.forEach(user => {
      console.log(`User ${user.name} <${user.email}> has inconsistent status:`);
      console.log(`  status: ${user.status}, isActive: ${user.isActive}`);
    });
    
    // Fix inconsistent users
    let fixedCount = 0;
    
    for (const user of inconsistentUsers) {
      let update = {};
      
      // Case 1: Missing status field
      if (user.status === undefined && user.isActive !== undefined) {
        update.status = user.isActive ? 'Active' : 'Inactive';
        console.log(`Setting status to ${update.status} for user ${user.email} based on isActive=${user.isActive}`);
      }
      // Case 2: Missing isActive field
      else if (user.isActive === undefined && user.status !== undefined) {
        update.isActive = user.status === 'Active';
        console.log(`Setting isActive to ${update.isActive} for user ${user.email} based on status=${user.status}`);
      }
      // Case 3: Inconsistent active
      else if (user.status === 'Active' && user.isActive === false) {
        update.isActive = true;
        console.log(`Fixing inconsistent active user ${user.email}: setting isActive to true`);
      }
      // Case 4: Inconsistent inactive/suspended
      else if ((user.status === 'Inactive' || user.status === 'Suspended') && user.isActive === true) {
        update.isActive = false;
        console.log(`Fixing inconsistent inactive/suspended user ${user.email}: setting isActive to false`);
      }
      // Case 5: Missing both fields
      else if (user.status === undefined && user.isActive === undefined) {
        update.status = 'Active';
        update.isActive = true;
        console.log(`User ${user.email} missing both status fields, setting to Active`);
      }
      
      // Apply update if needed
      if (Object.keys(update).length > 0) {
        const result = await usersCollection.updateOne(
          { _id: user._id },
          { $set: update }
        );
        
        if (result.modifiedCount > 0) {
          fixedCount++;
        }
      }
    }
    
    console.log(`Fixed ${fixedCount} users`);
    
    // Verify fixes
    const afterFix = await usersCollection.find().toArray();
    
    // Check status distribution after fixes
    const afterStatusCount = {
      undefined: 0,
      Active: 0,
      Inactive: 0,
      Suspended: 0
    };
    
    const afterIsActiveCount = {
      undefined: 0,
      true: 0,
      false: 0
    };
    
    afterFix.forEach(user => {
      // Count status values
      if (!user.status) {
        afterStatusCount.undefined++;
      } else {
        afterStatusCount[user.status] = (afterStatusCount[user.status] || 0) + 1;
      }
      
      // Count isActive values
      if (user.isActive === undefined) {
        afterIsActiveCount.undefined++;
      } else {
        afterIsActiveCount[user.isActive]++;
      }
    });
    
    console.log('Status distribution after fixes:');
    console.log(afterStatusCount);
    console.log('isActive distribution after fixes:');
    console.log(afterIsActiveCount);
    
    console.log('Final status fix completed');
  } catch (error) {
    console.error('Error in final status fix:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the fix
finalStatusFix(); 