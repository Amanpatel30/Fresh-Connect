import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Hotel from './models/Hotel.js';
import Inventory from './models/Inventory.js';
import MenuItem from './models/MenuItem.js';
import Order from './models/Order.js';
import Staff from './models/Staff.js';
import Task from './models/Task.js';
import UrgentSale from './models/UrgentSale.js';
import Product from './models/Product.js';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-waste-management';

const sampleData = {
  users: [
    { 
      name: 'John Doe', 
      email: 'john@example.com', 
      password: 'password123', 
      role: 'user', 
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'Example City',
        state: 'Example State',
        postalCode: '12345',
        country: 'Example Country'
      }
    },
    { 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      password: 'password123', 
      role: 'user', 
      phone: '2345678901',
      address: {
        street: '456 Oak St',
        city: 'Example City',
        state: 'Example State',
        postalCode: '12345',
        country: 'Example Country'
      }
    },
    { 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      password: 'password123', 
      role: 'user', 
      phone: '3456789012',
      address: {
        street: '789 Pine St',
        city: 'Example City',
        state: 'Example State',
        postalCode: '12345',
        country: 'Example Country'
      }
    },
    { 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      password: 'password123', 
      role: 'user', 
      phone: '4567890123',
      address: {
        street: '321 Elm St',
        city: 'Example City',
        state: 'Example State',
        postalCode: '12345',
        country: 'Example Country'
      }
    },
    { 
      name: 'Tom Brown', 
      email: 'tom@example.com', 
      password: 'password123', 
      role: 'user', 
      phone: '5678901234',
      address: {
        street: '654 Maple St',
        city: 'Example City',
        state: 'Example State',
        postalCode: '12345',
        country: 'Example Country'
      }
    },
    {
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      password: bcrypt.hashSync('password123', 10),
      phone: '9876543210',
      role: 'user',
      createdAt: new Date(),
    },
    {
      name: 'Ananya Singh',
      email: 'ananya@example.com',
      password: bcrypt.hashSync('password123', 10),
      phone: '8765432109',
      role: 'user',
      createdAt: new Date(),
    },
    {
      name: 'Vikram Mehta',
      email: 'vikram@example.com',
      password: bcrypt.hashSync('password123', 10),
      phone: '7654321098',
      role: 'user',
      createdAt: new Date(),
    },
    {
      name: 'Pooja Patel',
      email: 'pooja@example.com',
      password: bcrypt.hashSync('password123', 10),
      phone: '6543210987',
      role: 'user',
      createdAt: new Date(),
    },
    {
      name: 'Rajat Kumar',
      email: 'rajat@example.com',
      password: bcrypt.hashSync('password123', 10),
      phone: '5432109876',
      role: 'user',
      createdAt: new Date(),
    }
  ],
  hotels: [
    {
      name: 'Grand Hotel',
      email: 'info@grandhotel.com',
      password: 'hotel123',
      address: {
        street: '123 Main St',
        city: 'Example City',
        state: 'Example State',
        zipCode: '12345',
        country: 'Example Country'
      },
      phone: '1234567890',
      description: 'A luxurious hotel in the heart of the city',
      rating: 4.5,
      numReviews: 100,
      reviews: []
    },
    {
      name: 'Seaside Resort',
      email: 'info@seasideresort.com',
      password: 'hotel123',
      address: {
        street: '456 Beach Rd',
        city: 'Coastal City',
        state: 'Coastal State',
        zipCode: '23456',
        country: 'Example Country'
      },
      phone: '2345678901',
      description: 'Beautiful beachfront resort with stunning views',
      rating: 4.8,
      numReviews: 150,
      reviews: []
    },
    {
      name: 'Mountain Lodge',
      email: 'info@mountainlodge.com',
      password: 'hotel123',
      address: {
        street: '789 Mountain Rd',
        city: 'Mountain City',
        state: 'Mountain State',
        zipCode: '34567',
        country: 'Example Country'
      },
      phone: '3456789012',
      description: 'Cozy mountain retreat with scenic views',
      rating: 4.2,
      numReviews: 80,
      reviews: []
    },
    {
      name: 'City Center Inn',
      email: 'info@citycenterinn.com',
      password: 'hotel123',
      address: {
        street: '321 Downtown St',
        city: 'Metro City',
        state: 'Metro State',
        zipCode: '45678',
        country: 'Example Country'
      },
      phone: '4567890123',
      description: 'Modern hotel in the business district',
      rating: 4.0,
      numReviews: 120,
      reviews: []
    },
    {
      name: 'Riverside Hotel',
      email: 'info@riversidehotel.com',
      password: 'hotel123',
      address: {
        street: '654 River Rd',
        city: 'River City',
        state: 'River State',
        zipCode: '56789',
        country: 'Example Country'
      },
      phone: '5678901234',
      description: 'Peaceful hotel with river views',
      rating: 4.6,
      numReviews: 90,
      reviews: []
    }
  ]
};

// This file has been commented out after successful data insertion
// Uncomment if you need to re-insert sample data

/*
async function insertData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Inventory.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await Staff.deleteMany({});
    await Task.deleteMany({});
    await UrgentSale.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Insert users
    const users = await Promise.all([...sampleData.users.map(userData => User.create(userData))]);
    console.log('Inserted users');

    // Insert hotels with owner references
    const hotels = await Promise.all([
      ...sampleData.hotels.map((hotelData, index) => {
        return Hotel.create({
          ...hotelData,
          owner: users[index]._id
        });
      })
    ]);
    console.log('Inserted hotels');

    // Insert products
    const products = await Promise.all([
      ...users.map((user, index) => Product.create({
        seller: user._id,
        name: `Fresh Vegetables Bundle ${index + 1}`,
        price: 50 + (index * 5),
        stock: 20,
        unit: 'kg',
        category: 'Vegetables',
        description: `Fresh organic vegetables from farm ${index + 1}`,
        image: 'https://example.com/vegetables.jpg',
        isVerified: true,
        rating: 4.5,
        numReviews: 10,
        reviews: []
      }))
    ]);
    console.log('Inserted products');

    // Insert inventory items
    await Promise.all([
      ...hotels.map((hotel, index) => Inventory.create({
        ...sampleData.inventory[index % sampleData.inventory.length],
        hotel: hotel._id
      }))
    ]);

    // Insert menu items
    await Promise.all([
      ...hotels.map((hotel, index) => MenuItem.create({
        ...sampleData.menuItems[index % sampleData.menuItems.length],
        hotel: hotel._id
      }))
    ]);

    // Insert orders
    await Promise.all([
      ...hotels.map((hotel, index) => Order.create({
        buyer: users[0]._id, // Using the first user as buyer
        seller: users[index]._id, // Using corresponding hotel owner as seller
        items: [
          {
            product: products[index]._id,
            name: products[index].name,
            quantity: 10,
            unit: products[index].unit,
            price: products[index].price
          }
        ],
        shippingAddress: {
          street: '123 Buyer St',
          city: 'Buyer City',
          state: 'Buyer State',
          postalCode: '12345',
          country: 'Example Country'
        },
        phone: '9876543210',
        totalAmount: 500,
        status: 'delivered',
        paymentMethod: 'online',
        paymentStatus: 'completed',
        isUrgentSale: false
      }))
    ]);

    // Insert staff
    await Promise.all([
      ...hotels.map((hotel, index) => Staff.create({
        ...sampleData.staff[index % sampleData.staff.length],
        hotel: hotel._id
      }))
    ]);

    // Insert tasks
    await Promise.all([
      ...hotels.map((hotel, index) => Task.create({
        ...sampleData.tasks[index % sampleData.tasks.length],
        hotel: hotel._id,
        assignedTo: users[index]._id
      }))
    ]);

    // Insert urgent sales
    await Promise.all([
      ...users.map((user, index) => UrgentSale.create({
        seller: user._id,
        product: products[index]._id,
        name: `Urgent Sale ${index + 1}`,
        originalPrice: 100,
        discountedPrice: 70,
        stock: 10,
        unit: 'kg',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        description: 'Bundle of fresh vegetables at a discounted price',
        image: 'https://example.com/vegetables.jpg',
        isActive: true
      }))
    ]);
    console.log('Inserted sample data for all collections');

    console.log('Data insertion completed successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

insertData();
*/

// Data has been successfully inserted
console.log('This file is now commented out to prevent duplicate data insertion.');
console.log('Uncomment the code if you need to re-insert sample data.'); 
