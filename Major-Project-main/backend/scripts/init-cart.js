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
    initializeCart();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function initializeCart() {
  try {
    console.log(`Initializing cart for user ${USER_ID}`);
    
    // Define Cart schema
    const cartSchema = new mongoose.Schema(
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
          unique: true
        },
        items: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Product',
              required: true
            },
            quantity: {
              type: Number,
              required: true,
              min: 1,
              default: 1
            },
            price: {
              type: Number,
              required: true
            },
            addedAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        totalItems: {
          type: Number,
          default: 0
        },
        totalAmount: {
          type: Number,
          default: 0
        }
      },
      {
        timestamps: true
      }
    );

    // Pre-save middleware to calculate totals
    cartSchema.pre('save', function(next) {
      // Calculate total items and amount
      this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
      this.totalAmount = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      next();
    });

    const Cart = mongoose.model('Cart', cartSchema);
    
    // Check if user exists
    const userDoc = await mongoose.connection.db.collection('users').findOne({
      _id: new mongoose.Types.ObjectId(USER_ID)
    });
    
    if (!userDoc) {
      console.log(`User ${USER_ID} not found`);
      return;
    }
    
    console.log(`Found user: ${userDoc.name}`);
    
    // Check if cart already exists
    const existingCart = await Cart.findOne({ user: USER_ID });
    
    if (existingCart) {
      console.log(`Cart already exists for user ${USER_ID} with ${existingCart.items.length} items`);
      
      if (existingCart.items.length === 0) {
        // Add sample products to cart
        await addSampleProducts(Cart, existingCart);
      }
      
      return;
    }
    
    // Create new cart
    const newCart = new Cart({
      user: USER_ID,
      items: [],
      totalItems: 0,
      totalAmount: 0
    });
    
    // Save the cart
    await newCart.save();
    console.log(`Created new cart for user ${USER_ID}`);
    
    // Add sample products
    await addSampleProducts(Cart, newCart);
    
    // Also ensure dashboardStats matches
    const dashboardStatsUpdate = await mongoose.connection.db.collection('dashboardStats').updateOne(
      { user: new mongoose.Types.ObjectId(USER_ID) },
      { $set: { cartCount: 3 } }
    );
    
    console.log(`Updated dashboard stats: ${dashboardStatsUpdate.modifiedCount} document modified`);
    
    console.log('Cart initialization complete');
  } catch (error) {
    console.error('Error initializing cart:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

async function addSampleProducts(Cart, cart) {
  try {
    // Fetch some products
    const products = await mongoose.connection.db.collection('products').find().limit(3).toArray();
    
    if (products.length === 0) {
      console.log('No products found to add to cart');
      return;
    }
    
    console.log(`Found ${products.length} products to add to cart`);
    
    // Add products to cart
    for (const product of products) {
      cart.items.push({
        product: product._id,
        quantity: Math.floor(Math.random() * 3) + 1, // Random quantity between 1-3
        price: product.price || 99.99, // Use product price or default
        addedAt: new Date()
      });
    }
    
    // Save the cart
    await cart.save();
    
    console.log(`Added ${products.length} sample products to cart`);
    console.log(`Cart now has ${cart.items.length} items, total: $${cart.totalAmount.toFixed(2)}`);
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
} 