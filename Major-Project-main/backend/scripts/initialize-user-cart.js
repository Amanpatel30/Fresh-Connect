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
    migrateUserCart();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function migrateUserCart() {
  try {
    console.log(`Migrating cart for user ${USER_ID}`);
    
    // Define User schema with cart
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      cart: {
        items: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product'
            },
            quantity: Number,
            price: Number,
            addedAt: Date
          }
        ],
        totalItems: Number,
        totalAmount: Number
      }
    });
    
    // Define Cart schema
    const cartSchema = new mongoose.Schema({
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      items: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
          },
          quantity: Number,
          price: Number,
          addedAt: Date
        }
      ],
      totalItems: Number,
      totalAmount: Number
    });
    
    const User = mongoose.model('User', userSchema);
    const Cart = mongoose.model('Cart', cartSchema);
    
    // Check if user exists
    const user = await User.findById(USER_ID);
    
    if (!user) {
      console.log(`User ${USER_ID} not found`);
      return;
    }
    
    console.log(`Found user: ${user.name}`);
    
    // Check if cart exists in Cart collection
    const cart = await Cart.findOne({ user: USER_ID });
    
    if (!cart) {
      console.log(`No cart found for user ${USER_ID} in Cart collection`);
      return;
    }
    
    console.log(`Found cart with ${cart.items.length} items`);
    
    // Update user with cart data
    user.cart = {
      items: cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        addedAt: item.addedAt
      })),
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount
    };
    
    await user.save();
    console.log(`Migrated ${cart.items.length} items to user's embedded cart`);
    
    // Update dashboard stats
    const dashboardStatsUpdate = await mongoose.connection.db.collection('dashboardStats').updateOne(
      { user: new mongoose.Types.ObjectId(USER_ID) },
      { $set: { cartCount: cart.items.length } }
    );
    
    console.log(`Updated dashboard stats: ${dashboardStatsUpdate.modifiedCount} document modified`);
    
    console.log('Cart migration complete');
  } catch (error) {
    console.error('Error migrating cart:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
} 