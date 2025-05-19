const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    isVerified: true,
    verifiedAt: new Date(),
    phone: '+919876543210',
    address: {
      street: '123 Admin Street',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560001',
      country: 'India'
    }
  },
  {
    name: 'Green Farms',
    email: 'seller@example.com',
    password: 'password123',
    role: 'seller',
    isVerified: true,
    verifiedAt: new Date(),
    phone: '+919876543211',
    address: {
      street: '456 Farm Road',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India'
    }
  },
  {
    name: 'Regular User',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    verifiedAt: new Date(),
    phone: '+919876543212',
    address: {
      street: '789 User Lane',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India'
    }
  }
];

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    const createdUsers = [];
    for (const user of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
    }

    console.log(`Seeded ${createdUsers.length} users successfully`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

module.exports = seedUsers; 