import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Define MongoDB URL with fallback to localhost
const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/major-project';

console.log('Attempting to connect to MongoDB at:', DB_URL);

mongoose.connect(DB_URL)
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    console.log('Connection State:', mongoose.connection.readyState);
    console.log('Database Name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);

    // List all collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('Collections in database:');
        collections.forEach(collection => {
          console.log(`- ${collection.name}`);
        });
        process.exit(0);
      })
      .catch(err => {
        console.error('Error listing collections:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }); 