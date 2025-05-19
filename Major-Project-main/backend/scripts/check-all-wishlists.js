import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

// User ID to check
const USER_ID = process.argv[2] || '67d7bc7f7833ae4cea2668f9';

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  wishlist: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: Date
    }
  ]
});

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      addedAt: Date
    }
  ]
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
    checkWishlists();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function checkWishlists() {
  try {
    // Register models
    const User = mongoose.model('User', userSchema);
    const Wishlist = mongoose.model('Wishlist', wishlistSchema);
    
    // Check raw collections
    console.log('--- CHECKING RAW COLLECTIONS ---');
    
    // 1. Check if user exists directly in the collection
    const userDoc = await mongoose.connection.db.collection('users').findOne({ 
      _id: new mongoose.Types.ObjectId(USER_ID) 
    });
    
    if (userDoc) {
      console.log(`User found in 'users' collection: ${userDoc.name} (${userDoc.email})`);
      if (userDoc.wishlist && Array.isArray(userDoc.wishlist)) {
        console.log(`User has ${userDoc.wishlist.length} items in embedded wishlist`);
      } else {
        console.log('User has no embedded wishlist array');
      }
    } else {
      console.log(`No user found with ID ${USER_ID} in 'users' collection`);
    }
    
    // 2. Check if wishlist exists in Wishlist collection
    const wishlistDoc = await mongoose.connection.db.collection('wishlists').findOne({
      user: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (wishlistDoc) {
      console.log(`Wishlist found in 'wishlists' collection for user ${USER_ID}`);
      if (wishlistDoc.products && Array.isArray(wishlistDoc.products)) {
        console.log(`Wishlist has ${wishlistDoc.products.length} products`);
      } else {
        console.log('Wishlist has no products array');
      }
    } else {
      console.log(`No wishlist found for user ${USER_ID} in 'wishlists' collection`);
    }
    
    // 3. Check dashboardStats
    const dashboardStats = await mongoose.connection.db.collection('dashboardStats').findOne({
      user: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (dashboardStats) {
      console.log(`Dashboard stats found for user ${USER_ID}`);
      console.log(`Wishlist count in dashboard stats: ${dashboardStats.wishlistCount}`);
    } else {
      console.log(`No dashboard stats found for user ${USER_ID}`);
    }
    
    console.log('\n--- CHECKING WITH MONGOOSE MODELS ---');
    
    try {
      // 1. Check user with mongoose model
      const user = await User.findById(USER_ID);
      if (user) {
        console.log(`User found with Mongoose: ${user.name}`);
        console.log(`User wishlist items: ${user.wishlist ? user.wishlist.length : 0}`);
      } else {
        console.log(`No user found with Mongoose for ID ${USER_ID}`);
      }
      
      // 2. Check wishlist with mongoose model
      const wishlist = await Wishlist.findOne({ user: USER_ID });
      if (wishlist) {
        console.log(`Wishlist found with Mongoose for user ${USER_ID}`);
        console.log(`Wishlist products: ${wishlist.products ? wishlist.products.length : 0}`);
      } else {
        console.log(`No wishlist found with Mongoose for user ${USER_ID}`);
      }
    } catch (modelError) {
      console.error('Error checking with Mongoose models:', modelError.message);
    }
    
    console.log('\n--- DATABASE COLLECTIONS ---');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error checking wishlists:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
} 