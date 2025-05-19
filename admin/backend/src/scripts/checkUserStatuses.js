const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const User = require('../models/User');

// Connection URI
const uri = process.env.MONGO_URI;
console.log('Using connection string:', uri);

async function checkUserStatuses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully!');

    // Get all users
    const users = await User.find().select('name email role status isActive');
    
    console.log(`Found ${users.length} users in database`);
    
    // Log each user's status
    users.forEach(user => {
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Status: ${user.status || 'undefined'}`);
      console.log(`  isActive: ${user.isActive !== undefined ? user.isActive : 'undefined'}`);
      console.log('-----------------------');
    });

    console.log('Status check complete!');
  } catch (error) {
    console.error('Error checking user statuses:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Connection closed gracefully');
  }
}

// Run the function
checkUserStatuses(); 