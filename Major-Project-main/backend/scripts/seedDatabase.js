import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-management')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to clear existing data
const clearData = async () => {
  try {
    console.log('Clearing existing data...');
    await Order.deleteMany({ hotelId: process.argv[2] || '60d21b4667d0d8992e610c87' });
    await MenuItem.deleteMany({ hotelId: process.argv[2] || '60d21b4667d0d8992e610c87' });
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

// Function to create menu items
const createMenuItems = async () => {
  try {
    console.log('Creating menu items...');
    const hotelId = process.argv[2] || '60d21b4667d0d8992e610c87';
    
    const menuItems = [
      {
        name: "Vegetable Platter",
        description: "Fresh organic vegetables served with homemade dips",
        price: 450,
        category: "Appetizers",
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        image: "vegetable-platter.jpg",
        hotelId
      },
      {
        name: "Fresh Fruit Mix",
        description: "Seasonal fruits freshly cut and served with honey",
        price: 350,
        category: "Desserts",
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        image: "fruit-mix.jpg",
        hotelId
      },
      {
        name: "Homemade Pasta",
        description: "Fresh pasta made in-house with organic ingredients",
        price: 550,
        category: "Main Course",
        isVegetarian: true,
        isVegan: false,
        isGlutenFree: false,
        image: "homemade-pasta.jpg",
        hotelId
      },
      {
        name: "Vegan Burger Meal",
        description: "Plant-based burger with sweet potato fries",
        price: 650,
        category: "Main Course",
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: false,
        image: "vegan-burger.jpg",
        hotelId
      },
      {
        name: "Gourmet Salad",
        description: "Mixed greens with seasonal toppings and house dressing",
        price: 400,
        category: "Starters",
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        image: "gourmet-salad.jpg",
        hotelId
      }
    ];
    
    const createdMenuItems = await MenuItem.insertMany(menuItems);
    console.log(`${createdMenuItems.length} menu items created`);
    return createdMenuItems;
  } catch (error) {
    console.error('Error creating menu items:', error);
    process.exit(1);
  }
};

// Function to create orders for the past 7 days
const createOrders = async (menuItems) => {
  try {
    console.log('Creating orders...');
    const hotelId = process.argv[2] || '60d21b4667d0d8992e610c87';
    
    // Get dates for the past 7 days
    const today = new Date();
    const days = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push({
        date,
        dayName: dayNames[date.getDay()]
      });
    }
    
    // Create orders for each day
    const orders = [];
    
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const randomAmount = Math.floor(Math.random() * 1500) + 500;
      const randomQuantity = Math.floor(Math.random() * 3) + 1;
      const menuItem = menuItems[i % menuItems.length];
      
      const order = {
        items: [
          {
            menuItemId: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: randomQuantity
          }
        ],
        totalAmount: menuItem.price * randomQuantity,
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "online",
        hotelId,
        createdAt: day.date,
        updatedAt: day.date
      };
      
      orders.push(order);
    }
    
    // Add a few more orders with different menu items to create top selling items
    for (let i = 0; i < 10; i++) {
      const randomDay = days[Math.floor(Math.random() * days.length)];
      const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1;
      
      const order = {
        items: [
          {
            menuItemId: randomMenuItem._id,
            name: randomMenuItem.name,
            price: randomMenuItem.price,
            quantity: randomQuantity
          }
        ],
        totalAmount: randomMenuItem.price * randomQuantity,
        status: "delivered",
        paymentStatus: "paid",
        paymentMethod: "online",
        hotelId,
        createdAt: randomDay.date,
        updatedAt: randomDay.date
      };
      
      orders.push(order);
    }
    
    const createdOrders = await Order.insertMany(orders);
    console.log(`${createdOrders.length} orders created`);
  } catch (error) {
    console.error('Error creating orders:', error);
    process.exit(1);
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await clearData();
    
    // Create menu items
    const menuItems = await createMenuItems();
    
    // Create orders
    await createOrders(menuItems);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase(); 