const { MongoClient, ObjectId } = require('mongodb');

// Connection URL and Database Name
const url = 'mongodb://localhost:27017';
const dbName = 'major-project'; // Replace with your actual database name

async function updateOrders() {
  let client;

  try {
    // Connect to MongoDB
    client = new MongoClient(url);
    await client.connect();
    console.log('Connected to MongoDB');

    // Get database and collection
    const db = client.db(dbName);
    const ordersCollection = db.collection('orders');

    // The seller ID to use (this should match the authenticated user's ID)
    const sellerId = new ObjectId('67ce83e6b49cd8fe9297a753');

    // Update all orders to include the seller field
    const result = await ordersCollection.updateMany(
      { seller: { $exists: false } }, // Only update orders without a seller field
      { $set: { seller: sellerId } }
    );

    console.log(`Updated ${result.modifiedCount} orders to include seller field`);

    // Verify the update
    const orders = await ordersCollection.find({}).toArray();
    console.log(`Total orders in database: ${orders.length}`);
    console.log('First order:', orders[0]);

  } catch (error) {
    console.error('Error updating orders:', error);
  } finally {
    // Close the connection
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the update function
updateOrders().catch(console.error); 