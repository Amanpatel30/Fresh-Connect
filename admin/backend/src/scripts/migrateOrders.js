const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

const migrateOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Get all orders
    const orders = await Order.find({});

    console.log(`Found ${orders.length} orders to migrate`);

    // Update each order
    for (const order of orders) {
      // If order has products, get the seller from the first product
      if (order.orderItems && order.orderItems.length > 0) {
        const firstProduct = order.orderItems[0].product;
        if (firstProduct) {
          const Product = mongoose.model('Product');
          const product = await Product.findById(firstProduct);
          if (product && product.user) {
            order.sellerId = product.user;
          }
        }
      }

      // If order has a hotel reference in shipping address, extract it
      if (order.shippingAddress && order.shippingAddress.address) {
        const Hotel = mongoose.model('Hotel');
        const hotel = await Hotel.findOne({ 
          address: { $regex: new RegExp(order.shippingAddress.address, 'i') }
        });
        if (hotel) {
          order.hotelId = hotel._id;
        }
      }

      await order.save();
      console.log(`Migrated order ${order._id}`);
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOrders(); 