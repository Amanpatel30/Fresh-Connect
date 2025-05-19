const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const User = require('../models/User');

// The email of the user to update
const userEmail = 'sarah@seller.com';

// The status to set
const newStatus = 'Inactive';
const isActive = newStatus === 'Active';

// Connection URI
const uri = process.env.MONGO_URI;
console.log('Using connection string:', uri);

async function setUserStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully!');

    // Find user by email
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      return;
    }
    
    console.log('Found user to update:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Current Status: ${user.status || 'undefined'}`);
    console.log(`  Current isActive: ${user.isActive !== undefined ? user.isActive : 'undefined'}`);
    
    // Update user with new status
    console.log(`Setting status to "${newStatus}" and isActive to ${isActive}`);
    
    // Update directly in the database using updateOne
    const result = await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          status: newStatus,
          isActive: isActive
        }
      }
    );
    
    console.log('Update result:', result);
    
    // Verify the update worked
    const updatedUser = await User.findOne({ email: userEmail });
    console.log('Updated user status:');
    console.log(`  New Status: ${updatedUser.status}`);
    console.log(`  New isActive: ${updatedUser.isActive}`);

    console.log('Status update complete!');
  } catch (error) {
    console.error('Error updating user status:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Connection closed gracefully');
  }
}

// Run the function
setUserStatus(); 