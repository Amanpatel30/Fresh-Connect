const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const sampleProducts = [
  {
    name: 'Tomatoes (5kg)',
    description: 'Fresh organic tomatoes from local farm',
    price: 150,
    category: 'Vegetables',
    stock: 20,
    isUrgent: true,
    isFree: false,
    status: 'active',
    images: ['tomatoes.jpg']
  },
  {
    name: 'Spinach (2kg)',
    description: 'Fresh spinach leaves',
    price: 80,
    category: 'Vegetables',
    stock: 15,
    isUrgent: true,
    isFree: false,
    status: 'active',
    images: ['spinach.jpg']
  },
  {
    name: 'Vegetable Biryani',
    description: 'Freshly prepared vegetable biryani',
    price: 0,
    category: 'Food',
    stock: 5,
    isUrgent: false,
    isFree: true,
    status: 'active',
    images: ['biryani.jpg']
  },
  {
    name: 'Mixed Vegetable Curry',
    description: 'Mixed vegetable curry with rice',
    price: 0,
    category: 'Food',
    stock: 3,
    isUrgent: false,
    isFree: true,
    status: 'active',
    images: ['curry.jpg']
  }
];

const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Get a seller user
    const seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      throw new Error('No seller found. Please seed users first.');
    }

    // Add seller reference to products
    const productsWithSeller = sampleProducts.map(product => ({
      ...product,
      seller: seller._id
    }));

    // Insert sample products
    const insertedProducts = await Product.insertMany(productsWithSeller);
    console.log(`Seeded ${insertedProducts.length} products successfully`);
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

module.exports = seedProducts; 