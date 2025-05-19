const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('MONGO_URI:', process.env.MONGO_URI);

// Use direct mongoose model definition to avoid schema validation issues 
// during this one-time update
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully!');
    
    try {
      // Find users to update
      const users = await User.find();
      console.log(`Found ${users.length} users total`);
      
      // Count by role for debugging
      const roleCounts = {};
      users.forEach(user => {
        roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
      });
      console.log('Users by role:', roleCounts);
      
      // Update a subset of users to be inactive
      const usersToUpdate = users.slice(0, 3); // First 3 users
      
      for (const user of usersToUpdate) {
        console.log(`Setting user ${user.name} (${user.email}) to inactive`);
        
        // Update directly to avoid validation
        await User.updateOne(
          { _id: user._id },
          { $set: { isActive: false } }
        );
        
        console.log(`Updated user ${user._id} to inactive`);
      }
      
      // Set one user to suspended
      if (users.length > 3) {
        const suspendedUser = users[3];
        console.log(`Setting user ${suspendedUser.name} to Suspended`);
        
        await User.updateOne(
          { _id: suspendedUser._id },
          { $set: { status: 'Suspended' } }
        );
        
        console.log(`Updated user ${suspendedUser._id} to Suspended`);
      }
      
      console.log('User status updates completed');
      
      // Close connection
      await mongoose.connection.close();
      console.log('Connection closed gracefully');
      process.exit(0);
      
    } catch (err) {
      console.error('Error updating users:', err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 