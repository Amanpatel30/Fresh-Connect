import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hotel from '../models/Hotel.js';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

// Test hotel account details
const testHotel = {
  name: 'Test Hotel',
  email: 'hotel1@example.com',
  password: 'password123',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country'
  },
  phone: '1234567890',
  isVerified: true,
  ownerName: 'Test Owner'
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 30000
})
  .then(() => {
    console.log('Connected to MongoDB');
    createHotelAccount();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to create a hotel account if it doesn't exist
async function createHotelAccount() {
  try {
    // Check if the hotel already exists
    const existingHotel = await Hotel.findOne({ email: testHotel.email });
    
    if (existingHotel) {
      console.log('Test hotel account already exists:', {
        id: existingHotel._id,
        email: existingHotel.email,
        name: existingHotel.name
      });
      
      // Update the password to ensure it works
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testHotel.password, salt);
      
      existingHotel.password = hashedPassword;
      await existingHotel.save();
      
      console.log('Password updated for existing account.');
      console.log('You can log in with:');
      console.log(`Email: ${testHotel.email}`);
      console.log(`Password: ${testHotel.password}`);
      
      mongoose.connection.close();
      return;
    }
    
    // Create a new hotel account using a direct approach
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testHotel.password, salt);
    
    const newHotel = {
      ...testHotel,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await Hotel.create(newHotel);
    
    console.log('Test hotel account created successfully:', {
      id: result._id,
      email: result.email,
      name: result.name
    });
    console.log('You can log in with:');
    console.log(`Email: ${testHotel.email}`);
    console.log(`Password: ${testHotel.password}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating/updating test hotel account:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 