import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the MongoDB URI from environment variables or use the default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

console.log('Attempting to connect to MongoDB at:', MONGODB_URI);

// Connection options
const options = {
  serverSelectionTimeoutMS: 10000, // 10 seconds
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI, options)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    
    // Verify connection by listing all collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('Available collections:');
        collections.forEach(collection => {
          console.log(` - ${collection.name}`);
        });
        
        // Close the connection and exit
        console.log('Closing connection...');
        mongoose.connection.close();
        console.log('Connection closed. Test successful!');
      })
      .catch(err => {
        console.error('Error listing collections:', err);
        mongoose.connection.close();
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }); 