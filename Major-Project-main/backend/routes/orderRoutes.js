import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getOrderStats,
  createTestOrder,
  createSimpleOrder,
  createBasicOrder,
  importOfflineOrders,
  createEmergencyOrder
} from '../controllers/orderController.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';

const router = express.Router();

// Debug route for specific hotel items in cart
router.get('/debug-hotel-cart/:hotelId', async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    console.log(`Debugging cart items for hotel ID: ${hotelId}`);
    
    // Find all carts that have items with this hotel ID as seller
    const carts = await Cart.find({
      'items.productSellerId': hotelId
    }).lean();
    
    // Create a summary
    const cartSummary = carts.map(cart => ({
      cartId: cart._id,
      userId: cart.user,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      relevantItems: cart.items
        .filter(item => 
          item.productSellerId && 
          (item.productSellerId.toString() === hotelId || 
           (typeof item.productSellerId === 'string' && item.productSellerId === hotelId))
        )
        .map(item => ({
          productId: item.product,
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
          image: item.productImage ? 'Yes' : 'No',
          sellerId: item.productSellerId
        }))
    }));
    
    res.json({
      message: `Found ${carts.length} carts with items from hotel ID ${hotelId}`,
      carts: cartSummary
    });
  } catch (error) {
    console.error('Error in debug cart endpoint:', error);
    res.status(500).json({
      message: 'Error in debug cart endpoint',
      error: error.message
    });
  }
});

// Debug route to check orders for specific hotel
router.get('/debug-hotel-orders/:hotelId', async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    console.log(`Debugging orders for hotel ID: ${hotelId}`);
    
    // Convert to ObjectId if valid
    let hotelObjectId = null;
    if (mongoose.Types.ObjectId.isValid(hotelId)) {
      hotelObjectId = new mongoose.Types.ObjectId(hotelId);
    }
    
    // Query with multiple possible ID formats
    const orders = await Order.find({
      $or: [
        { seller: hotelObjectId },
        { seller: hotelId },
        { hotelId: hotelObjectId },
        { hotelId: hotelId },
        { hotel: hotelObjectId },
        { hotel: hotelId }
      ]
    }).select('_id seller hotelId hotel createdAt totalAmount status paymentStatus').sort('-createdAt').lean();
    
    res.json({
      message: `Found ${orders.length} orders for hotel ID ${hotelId}`,
      orders: orders.map(o => ({
        id: o._id,
        seller: o.seller,
        hotelId: o.hotelId,
        hotel: o.hotel,
        amount: o.totalAmount,
        status: o.status,
        paymentStatus: o.paymentStatus,
        date: o.createdAt
      }))
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      message: 'Error in debug endpoint',
      error: error.message
    });
  }
});

// Regular order routes
router.get('/', protect, getOrders);
router.get('/stats', protect, getOrderStats);
router.get('/:id', protect, getOrder);
router.post('/', protect, createOrder);
router.patch('/:id/status', protect, updateOrderStatus);

// Simplified order routes
router.post('/simple', protect, createSimpleOrder);
router.post('/basic', protect, createBasicOrder);

// Offline order sync route
router.post('/import-offline', protect, importOfflineOrders);

// Emergency order route (no auth required)
router.post('/emergency', createEmergencyOrder);

// Test order route
router.post('/test', protect, createTestOrder);

export default router; 