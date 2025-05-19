import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';
const email = 'hotel1@example.com';
const newPassword = 'password123';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000
}).then(() => {
  console.log('Connected to MongoDB');
  resetPassword();
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

async function resetPassword() {
  try {
    // Use direct MongoDB operations instead of Mongoose model
    const db = mongoose.connection.db;
    const hotelsCollection = db.collection('hotels');
    
    // Find the hotel by email
    const hotel = await hotelsCollection.findOne({ email });
    if (!hotel) {
      console.error(`No hotel found with email ${email}`);
      process.exit(1);
    }
    
    console.log('Found hotel:', {
      _id: hotel._id,
      email: hotel.email,
      name: hotel.name
    });
    
    // Generate a new password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the password directly
    const result = await hotelsCollection.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Update result:', result);
    console.log(`Password for ${email} has been reset to '${newPassword}'`);
    console.log('Hashed password:', hashedPassword);
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
} 