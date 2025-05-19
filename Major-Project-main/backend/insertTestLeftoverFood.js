import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './models/Inventory.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project')
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to insert test free food listings
const insertFreeFoodListings = async () => {
  try {
    // Get hotel ID from command line argument or use a default
    const hotelId = process.argv[2] || '67ce83e6b49cd8fe9297a753';
    
    console.log(`Using hotel ID: ${hotelId}`);
    
    // Create multiple test free food listings
    const testListings = [
      {
        hotel: hotelId,
        name: 'Free Leftover Pasta',
        description: 'Fresh pasta with tomato sauce from today\'s lunch service.',
        quantity: 10,
        unit: 'portions',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        price: 0, // Free
        category: 'meals',
        notes: 'Dietary info: Vegetarian\nLeftover food listing\nFree food for those in need',
        isLeftoverFood: true,
        isLowStock: false,
        location: 'Leftover Food',
        minStockLevel: 0,
        images: ['https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
      },
      {
        hotel: hotelId,
        name: 'Free Bread Rolls',
        description: 'Fresh bread rolls from our bakery, perfect for dinner.',
        quantity: 20,
        unit: 'pcs',
        expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        price: 0, // Free
        category: 'bakery',
        notes: 'Dietary info: Vegan\nLeftover food listing\nFree bread for community',
        isLeftoverFood: true,
        isLowStock: false,
        location: 'Leftover Food',
        minStockLevel: 0,
        images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
      },
      {
        hotel: hotelId,
        name: 'Free Fruit Platter',
        description: 'Assorted fresh fruits from our breakfast buffet.',
        quantity: 15,
        unit: 'portions',
        expiryDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
        price: 0, // Free
        category: 'other',
        notes: 'Dietary info: Vegan, Gluten-Free\nLeftover food listing\nFree healthy snacks',
        isLeftoverFood: true,
        isLowStock: false,
        location: 'Leftover Food',
        minStockLevel: 0,
        images: ['https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80']
      }
    ];
    
    // Insert all test listings
    const createdListings = await Inventory.insertMany(testListings);
    
    console.log('Free food listings created successfully:');
    console.log(JSON.stringify(createdListings, null, 2));
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error inserting free food listings:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the function
insertFreeFoodListings(); 