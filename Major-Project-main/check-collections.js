const { MongoClient, ObjectId } = require('mongodb');

// Connection URL and Database Name
const url = 'mongodb://localhost:27017';
const dbName = 'major-project'; // Replace with your actual database name

async function checkCollections() {
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');

    // Get database and collection
    const db = client.db(dbName);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check orders collection
    const ordersCollection = db.collection('orders');
    const orderCount = await ordersCollection.countDocuments();
    console.log(`\nTotal orders: ${orderCount}`);
    
    if (orderCount > 0) {
      // Get a sample order
      const sampleOrder = await ordersCollection.findOne({});
      console.log('Sample order:');
      console.log(JSON.stringify(sampleOrder, null, 2));
      
      // Check if buyer is an ObjectId or embedded document
      if (sampleOrder.buyer) {
        console.log('\nBuyer field type:', typeof sampleOrder.buyer);
        if (typeof sampleOrder.buyer === 'object' && !(sampleOrder.buyer instanceof ObjectId)) {
          console.log('Buyer is an embedded document');
        } else {
          console.log('Buyer is a reference (ObjectId)');
          
          // Try to find the referenced user
          const usersCollection = db.collection('users');
          const buyerUser = await usersCollection.findOne({ _id: sampleOrder.buyer });
          
          if (buyerUser) {
            console.log('Found referenced buyer:');
            console.log(JSON.stringify(buyerUser, null, 2));
          } else {
            console.log('Referenced buyer not found in users collection');
          }
        }
      } else {
        console.log('Order has no buyer field');
      }
    }
    
    // Check users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\nTotal users: ${userCount}`);
    
    if (userCount > 0) {
      // Get a sample user
      const sampleUser = await usersCollection.findOne({});
      console.log('Sample user:');
      console.log(JSON.stringify(sampleUser, null, 2));
    }

  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the function
checkCollections().catch(console.error); 