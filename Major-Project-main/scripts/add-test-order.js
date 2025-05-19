const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Order schema
const orderSchema = new mongoose.Schema({
  hotelId: mongoose.Schema.Types.ObjectId,
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  buyer: mongoose.Schema.Types.ObjectId,
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  createdAt: Date,
  updatedAt: Date
});

const Order = mongoose.model('Order', orderSchema);

// Create a test order
const createTestOrder = async () => {
  try {
    // Replace 'YOUR_HOTEL_ID' with your actual hotel ID
    const testOrder = new Order({
      hotelId: 'YOUR_HOTEL_ID', // Replace this with your actual hotel ID
      totalAmount: 150.00,
      status: 'delivered',
      paymentStatus: 'completed',
      buyer: new mongoose.Types.ObjectId(), // This creates a random ObjectId
      items: [{
        name: 'Test Item',
        quantity: 2,
        price: 75.00
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedOrder = await testOrder.save();
    console.log('Test order created:', savedOrder);
    process.exit(0);
  } catch (error) {
    console.error('Error creating test order:', error);
    process.exit(1);
  }
};

createTestOrder(); 