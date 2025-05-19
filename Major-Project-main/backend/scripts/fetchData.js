 import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

async function fetchData() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n=== Available Collections ===');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Fetch sample data from each collection
    console.log('\n=== Sample Data from Collections ===');
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db.collection(collectionName).find({}).limit(2).toArray();
      
      console.log(`\n--- Collection: ${collectionName} ---`);
      if (data.length > 0) {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('No data found in this collection');
      }
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Execute the function
fetchData(); 