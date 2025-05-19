import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

// User ID to check
const USER_ID = process.argv[2] || '67d7bc7f7833ae4cea2668f9';

// Define Wishlist schema
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
}, { timestamps: true });

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB at:', MONGODB_URI);
    checkWishlist();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function checkWishlist() {
  try {
    // Register the Wishlist model
    const Wishlist = mongoose.model('Wishlist', wishlistSchema);
    
    // Find wishlist for user
    const wishlist = await Wishlist.findOne({ user: USER_ID });
    
    if (!wishlist) {
      console.log(`No wishlist found for user ${USER_ID}`);
      
      // Create new wishlist with 5 placeholder products
      const newWishlist = new Wishlist({
        user: USER_ID,
        products: [
          { product: new mongoose.Types.ObjectId(), addedAt: new Date() },
          { product: new mongoose.Types.ObjectId(), addedAt: new Date() },
          { product: new mongoose.Types.ObjectId(), addedAt: new Date() },
          { product: new mongoose.Types.ObjectId(), addedAt: new Date() },
          { product: new mongoose.Types.ObjectId(), addedAt: new Date() }
        ]
      });
      
      await newWishlist.save();
      console.log(`Created new wishlist for user ${USER_ID} with 5 products`);
    } else {
      console.log(`Found wishlist for user ${USER_ID}`);
      console.log(`Products in wishlist: ${wishlist.products.length}`);
      
      // Ensure 5 products in wishlist
      if (wishlist.products.length !== 5) {
        // Add or remove products to make it 5
        if (wishlist.products.length < 5) {
          // Add products
          const productsToAdd = 5 - wishlist.products.length;
          for (let i = 0; i < productsToAdd; i++) {
            wishlist.products.push({ 
              product: new mongoose.Types.ObjectId(), 
              addedAt: new Date() 
            });
          }
          await wishlist.save();
          console.log(`Added ${productsToAdd} products to wishlist`);
        } else {
          // Remove products
          wishlist.products = wishlist.products.slice(0, 5);
          await wishlist.save();
          console.log(`Trimmed wishlist to 5 products`);
        }
      }
      
      console.log(`Updated wishlist has ${wishlist.products.length} products`);
    }
    
    // Check dashboard stats collection
    const dashboardStats = await mongoose.connection.db.collection('dashboardStats').findOne({
      user: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (dashboardStats) {
      console.log(`Current wishlistCount in dashboardStats: ${dashboardStats.wishlistCount}`);
      
      // Update wishlistCount to 5
      await mongoose.connection.db.collection('dashboardStats').updateOne(
        { user: new mongoose.Types.ObjectId(USER_ID) },
        { $set: { wishlistCount: 5 } }
      );
      
      console.log('Updated dashboardStats wishlistCount to 5');
    } else {
      console.log('No dashboardStats found for user');
      
      // Create dashboardStats with wishlistCount 5
      await mongoose.connection.db.collection('dashboardStats').insertOne({
        user: new mongoose.Types.ObjectId(USER_ID),
        totalProducts: 150,
        wishlistCount: 5,
        cartCount: 3,
        totalReviews: 2,
        totalViews: 10,
        updatedAt: new Date()
      });
      
      console.log('Created dashboardStats with wishlistCount 5');
    }
  } catch (error) {
    console.error('Error checking wishlist:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
} 