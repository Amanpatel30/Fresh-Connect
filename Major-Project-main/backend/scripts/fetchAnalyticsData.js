import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/major-project';

async function fetchAnalyticsData() {
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

    // Fetch data from specific collections relevant to analytics
    const relevantCollections = ['orders', 'menuitems', 'inventories', 'hotels', 'users'];
    
    for (const collectionName of relevantCollections) {
      if (collections.some(c => c.name === collectionName)) {
        console.log(`\n=== Data from ${collectionName} collection ===`);
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`Total documents: ${count}`);
        
        if (count > 0) {
          const data = await mongoose.connection.db.collection(collectionName).find({}).limit(2).toArray();
          console.log('Sample data:');
          console.log(JSON.stringify(data, null, 2));
          
          // For orders collection, get some analytics
          if (collectionName === 'orders') {
            const totalRevenue = await mongoose.connection.db.collection(collectionName).aggregate([
              { $match: { status: { $in: ['delivered', 'completed'] } } },
              { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]).toArray();
            
            console.log('\nOrder Analytics:');
            console.log(`Total Revenue: ${totalRevenue.length > 0 ? totalRevenue[0].total : 0}`);
            
            const ordersByStatus = await mongoose.connection.db.collection(collectionName).aggregate([
              { $group: { _id: '$status', count: { $sum: 1 } } }
            ]).toArray();
            
            console.log('Orders by Status:');
            console.log(ordersByStatus);
          }
          
          // For inventory collection, get some analytics
          if (collectionName === 'inventories') {
            const totalValue = await mongoose.connection.db.collection(collectionName).aggregate([
              { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$quantity'] } } } }
            ]).toArray();
            
            console.log('\nInventory Analytics:');
            console.log(`Total Inventory Value: ${totalValue.length > 0 ? totalValue[0].total : 0}`);
            
            const lowStock = await mongoose.connection.db.collection(collectionName).find({ quantity: { $lte: 10 } }).toArray();
            console.log(`Low Stock Items (<=10): ${lowStock.length}`);
          }
        } else {
          console.log('No data found in this collection');
        }
      } else {
        console.log(`\n=== Collection ${collectionName} does not exist ===`);
      }
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
}

// Execute the function
fetchAnalyticsData(); 