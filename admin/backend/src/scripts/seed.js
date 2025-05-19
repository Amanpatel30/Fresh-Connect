const mongoose = require('mongoose');
const seedUsers = require('./seedUsers');
const seedProducts = require('./seedProducts');
const seedPayments = require('./seedPayments');
const seedAnalyticsData = require('./seedAnalyticsData');
const seedComplaintData = require('./seedComplaintData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Seed users first
    await seedUsers();

    // Seed products next
    await seedProducts();

    // Seed payments
    await seedPayments();

    // Seed analytics data
    await seedAnalyticsData();

    // Seed complaint data
    await seedComplaintData();

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the seeding function
seedDatabase(); 