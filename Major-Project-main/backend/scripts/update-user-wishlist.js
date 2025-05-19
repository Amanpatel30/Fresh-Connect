import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

// User ID to update
const USER_ID = process.argv[2] || '67d7bc7f7833ae4cea2668f9';

// Define User schema that matches the actual structure
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
    updateUserWishlist();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function updateUserWishlist() {
  try {
    // Register the User model
    const User = mongoose.model('User', userSchema);
    
    // Find user
    const user = await User.findById(USER_ID);
    
    if (!user) {
      console.log(`User ${USER_ID} not found`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current wishlist items: ${user.wishlist.length}`);
    
    // Ensure user has exactly 5 wishlist items
    if (user.wishlist.length === 5) {
      console.log('User already has 5 wishlist items');
    } else if (user.wishlist.length < 5) {
      // Add more items to make it 5
      const productsToAdd = 5 - user.wishlist.length;
      console.log(`Adding ${productsToAdd} items to wishlist`);
      
      // Get some real product IDs if possible
      let productIds = [];
      try {
        const products = await mongoose.connection.db.collection('products').find().limit(10).toArray();
        productIds = products.map(p => p._id);
        console.log(`Found ${productIds.length} products to choose from`);
      } catch (err) {
        console.log('Could not get real products, using placeholder IDs');
        productIds = [];
      }
      
      // Create some product IDs (using real ones if available)
      for (let i = 0; i < productsToAdd; i++) {
        const productId = productIds.length > i 
          ? productIds[i] 
          : new mongoose.Types.ObjectId();
          
        user.wishlist.push({
          productId: productId,
          addedAt: new Date()
        });
      }
      
      await user.save();
      console.log(`Updated wishlist now has ${user.wishlist.length} items`);
    } else {
      // Trim the wishlist to 5 items
      console.log(`Trimming wishlist from ${user.wishlist.length} to 5 items`);
      user.wishlist = user.wishlist.slice(0, 5);
      await user.save();
      console.log(`Updated wishlist now has ${user.wishlist.length} items`);
    }
    
    // Also ensure dashboardStats matches
    const dashboardStats = await mongoose.connection.db.collection('dashboardStats').findOne({
      user: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (dashboardStats) {
      await mongoose.connection.db.collection('dashboardStats').updateOne(
        { user: new mongoose.Types.ObjectId(USER_ID) },
        { $set: { wishlistCount: 5 } }
      );
      console.log('Updated dashboardStats wishlistCount to 5');
    }
    
    console.log('Wishlist update complete');
  } catch (error) {
    console.error('Error updating wishlist:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
} 