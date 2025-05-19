import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

// User ID to update
const USER_ID = process.argv[2] || '67d7bc7f7833ae4cea2668f9';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
    syncWishlist();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function syncWishlist() {
  try {
    console.log(`Syncing wishlist for user ${USER_ID}`);
    
    // Get the wishlist from the Wishlist collection
    const wishlistDoc = await mongoose.connection.db.collection('wishlists').findOne({
      user: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (!wishlistDoc) {
      console.log('No wishlist document found for this user');
      return;
    }
    
    console.log(`Found wishlist with ${wishlistDoc.products.length} products`);
    
    // Get the user document
    const userDoc = await mongoose.connection.db.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (!userDoc) {
      console.log('User not found');
      return;
    }
    
    console.log(`Found user: ${userDoc.name}`);
    
    // Synchronize the embedded wishlist in the user document
    // First, check if user has a wishlist array
    if (!userDoc.wishlist || !Array.isArray(userDoc.wishlist)) {
      console.log('User has no wishlist array, creating one');
      await mongoose.connection.db.collection('users').updateOne(
        { _id: new mongoose.Types.ObjectId(USER_ID) },
        { $set: { wishlist: [] } }
      );
    }
    
    // Convert wishlist products to user's wishlist format
    const updatedWishlist = wishlistDoc.products.map(item => ({
      productId: item.product,
      addedAt: item.addedAt || new Date()
    }));
    
    // Update the user document with the wishlist data
    const updateResult = await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(USER_ID) },
      { $set: { wishlist: updatedWishlist } }
    );
    
    console.log(`Updated user's wishlist: ${updateResult.modifiedCount} document modified`);
    
    // Also ensure dashboardStats has the correct count
    const dashboardStatsUpdate = await mongoose.connection.db.collection('dashboardStats').updateOne(
      { user: new mongoose.Types.ObjectId(USER_ID) },
      { $set: { wishlistCount: wishlistDoc.products.length } }
    );
    
    console.log(`Updated dashboard stats: ${dashboardStatsUpdate.modifiedCount} document modified`);
    
    // Verify changes
    const updatedUser = await mongoose.connection.db.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(USER_ID)
    });
    
    console.log(`After synchronization: User has ${updatedUser.wishlist.length} items in wishlist`);
    
    console.log('Synchronization complete');
  } catch (error) {
    console.error('Error synchronizing wishlist:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
} 