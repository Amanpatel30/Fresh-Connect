const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const User = require('../models/User');

// Connection URI
const uri = process.env.MONGO_URI;
console.log('Using connection string:', uri);

async function fixUserStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully!');

    // Find users with missing status fields
    const usersWithoutStatus = await User.find({
      $or: [
        { status: { $exists: false } },
        { isActive: { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithoutStatus.length} users with missing status fields`);

    // Process each user
    let updatedCount = 0;
    
    for (const user of usersWithoutStatus) {
      console.log(`Fixing user: ${user.name} (${user.email})`);
      
      // Set status based on isActive value if it exists
      let status = 'Active';
      let isActive = true;
      
      // If user has isActive but no status
      if ('isActive' in user && !('status' in user)) {
        status = user.isActive ? 'Active' : 'Inactive';
        console.log(`  • Setting status to ${status} based on isActive=${user.isActive}`);
      }
      // If user has status but no isActive
      else if ('status' in user && !('isActive' in user)) {
        isActive = user.status === 'Active';
        console.log(`  • Setting isActive to ${isActive} based on status=${user.status}`);
      }
      // Neither field exists, set defaults
      else if (!('status' in user) && !('isActive' in user)) {
        console.log(`  • Setting default values: status=Active, isActive=true`);
      }
      
      // Update the user with both fields
      const result = await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            status: status, 
            isActive: isActive 
          } 
        }
      );
      
      console.log(`  • User updated: ${result.modifiedCount > 0 ? 'Success' : 'No change needed'}`);
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} users`);
    
    // Check for any inconsistent status values
    const inconsistentUsers = await User.find({
      $or: [
        { status: 'Active', isActive: false },
        { status: 'Inactive', isActive: true },
        { status: 'Suspended', isActive: true }
      ]
    });
    
    console.log(`Found ${inconsistentUsers.length} users with inconsistent status values`);
    
    // Fix inconsistent users
    for (const user of inconsistentUsers) {
      console.log(`Fixing inconsistent user: ${user.name} (${user.email})`);
      console.log(`  • Current values: status=${user.status}, isActive=${user.isActive}`);
      
      let isActive;
      if (user.status === 'Active') {
        isActive = true;
      } else {
        isActive = false;
      }
      
      const result = await User.updateOne(
        { _id: user._id },
        { $set: { isActive: isActive } }
      );
      
      console.log(`  • Corrected isActive to ${isActive}: ${result.modifiedCount > 0 ? 'Success' : 'No change needed'}`);
    }

    console.log('User status fix complete!');
  } catch (error) {
    console.error('Error fixing user status:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Connection closed gracefully');
  }
}

// Run the function
fixUserStatus(); 