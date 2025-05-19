const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User'); // Adjust path if needed

// Connect to database
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get all user names from the User collection
    const users = await User.find({}, 'name');
    const userNames = users.map(user => user.name).filter(name => name && name.trim() !== '');
    
    if (userNames.length === 0) {
      console.log('No user names found in the database');
      mongoose.disconnect();
      return;
    }
    
    console.log(`Found ${userNames.length} user names`);
    
    // Find orders without buyer names
    const ordersToUpdate = await Order.find({ 
      $or: [
        { "buyer.name": { $exists: false } },
        { "buyer.name": null },
        { "buyer.name": "" }
      ]
    });
    
    console.log(`Found ${ordersToUpdate.length} orders without names`);
    
    // Update each order with a random name
    let updatedCount = 0;
    
    for (const order of ordersToUpdate) {
      // Select a random name from the userNames array
      const randomIndex = Math.floor(Math.random() * userNames.length);
      const randomName = userNames[randomIndex];
      
      // Create buyer object if it doesn't exist
      if (!order.buyer) {
        order.buyer = {};
      }
      
      // Set the name
      order.buyer.name = randomName;
      
      // Save the order
      await order.save();
      updatedCount++;
    }
    
    console.log(`Updated ${updatedCount} orders with random names`);
    mongoose.disconnect();
  })
  .catch(err => console.error('Error:', err));
