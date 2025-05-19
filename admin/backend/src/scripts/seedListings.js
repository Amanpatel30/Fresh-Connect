const mongoose = require('mongoose');
const Listing = require('../models/Listing');
require('dotenv').config();

const sampleListings = [
  {
    title: "Urgent Sale: Fresh Tomatoes",
    description: "Large batch of fresh tomatoes available at discounted price",
    price: 25,
    quantity: 100,
    unit: "kg",
    isUrgent: true,
    isFree: false,
    sellerId: "65f2e8b7c261e8b7c261e8b7", // Replace with actual seller ID
    category: "Vegetables",
    location: "Delhi",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    title: "Urgent: Organic Spinach",
    description: "Fresh organic spinach available for immediate sale",
    price: 40,
    quantity: 50,
    unit: "kg",
    isUrgent: true,
    isFree: false,
    sellerId: "65f2e8b7c261e8b7c261e8b7", // Replace with actual seller ID
    category: "Leafy Greens",
    location: "Mumbai",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    title: "Free: Excess Carrots",
    description: "Excess carrots available for free pickup",
    price: 0,
    quantity: 30,
    unit: "kg",
    isUrgent: false,
    isFree: true,
    sellerId: "65f2e8b7c261e8b7c261e8b7", // Replace with actual seller ID
    category: "Vegetables",
    location: "Bangalore",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Free: Extra Potatoes",
    description: "Extra potatoes available for free distribution",
    price: 0,
    quantity: 50,
    unit: "kg",
    isUrgent: false,
    isFree: true,
    sellerId: "65f2e8b7c261e8b7c261e8b7", // Replace with actual seller ID
    category: "Root Vegetables",
    location: "Chennai",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
];

const seedListings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing listings
    await Listing.deleteMany({});
    console.log('Cleared existing listings');

    // Insert sample listings
    const insertedListings = await Listing.insertMany(sampleListings);
    console.log(`Successfully inserted ${insertedListings.length} listings`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding listings:', error);
    process.exit(1);
  }
};

seedListings(); 