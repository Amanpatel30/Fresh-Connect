import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  applyCoupon,
  calculateShipping,
  getLightweightCartData
} from '../controllers/cartController.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';

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

// Create a special test item in cart for the given hotel
router.post('/debug-add-test-item/:hotelId', async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const userId = req.body.userId;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: 'Valid user ID is required'
      });
    }
    
    console.log(`Adding test item for hotel ID: ${hotelId} to user: ${userId}`);
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: []
      });
    }
    
    // Create a test item
    const testItem = {
      product: new mongoose.Types.ObjectId(),
      quantity: 1,
      price: 19.99,
      addedAt: new Date(),
      productName: 'Test Item for ' + hotelId,
      productImage: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db',
      productCategory: 'Test Category',
      productSeller: hotelId,
      productSellerId: hotelId,
      productStock: 100
    };
    
    // Add to cart
    cart.items.push(testItem);
    
    // Recalculate totals
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Save
    await cart.save();
    
    res.json({
      message: 'Test item added to cart successfully',
      cart: {
        id: cart._id,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        items: cart.items.length
      }
    });
  } catch (error) {
    console.error('Error adding test item to cart:', error);
    res.status(500).json({
      message: 'Error adding test item to cart',
      error: error.message
    });
  }
});

// Debug route to analyze all carts in the system
router.get('/debug-all-carts', async (req, res) => {
  try {
    console.log('Debug route: getting all cart information');
    
    // Find all carts
    const carts = await Cart.find().lean();
    
    // Create a summary (with limited data for security/performance)
    const cartSummary = carts.map(cart => ({
      cartId: cart._id,
      userId: cart.user,
      totalItems: cart.totalItems || 0,
      totalAmount: cart.totalAmount || 0,
      itemCount: cart.items ? cart.items.length : 0,
      itemSummary: cart.items.map(item => ({
        productId: item.product,
        name: item.productName || 'Unknown',
        quantity: item.quantity || 0,
        price: item.price || 0,
        sellerId: item.productSellerId || 'N/A',
        sellerId_type: typeof item.productSellerId,
        addedAt: item.addedAt
      }))
    }));
    
    res.json({
      message: `Found ${carts.length} carts in the system`,
      timestamp: new Date().toISOString(),
      cartCount: carts.length,
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

// Direct insert endpoint for restaurant items
router.post('/direct-insert', protect, async (req, res) => {
  try {
    console.log('========== DIRECT INSERT ENDPOINT CALLED ==========');
    const { productId, name, price, image, restaurantId, quantity = 1 } = req.body;
    
    if (!productId || !name || !price) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: productId, name, price'
      });
    }
    
    console.log(`Direct insert request for product: ${name} (${productId})`);
    console.log(`User ID: ${req.user._id}, Restaurant ID: ${restaurantId}`);
    
    // Find or create cart
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      console.log(`Creating new cart for user: ${userId}`);
      cart = new Cart({
        user: userId,
        items: [],
        totalItems: 0,
        totalAmount: 0
      });
    } else {
      console.log(`Found existing cart with ${cart.items.length} items`);
    }
    
    // Check if product is already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product && item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if product exists
      console.log(`Updating existing item quantity from ${cart.items[existingItemIndex].quantity} to ${cart.items[existingItemIndex].quantity + quantity}`);
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      // Add new item to cart
      console.log('Adding new item directly to cart');
      const newItem = {
        product: productId,
        quantity: Number(quantity),
        price: price,
        addedAt: new Date(),
        productName: name,
        productImage: image || '',
        productCategory: 'Restaurant Item',
        productSeller: restaurantId,
        productSellerId: restaurantId
      };
      cart.items.push(newItem);
      console.log('New item added with product ID:', productId);
    }
    
    // Calculate cart totals
    cart.totalItems = cart.items.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);
    
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
    
    // Round to 2 decimal places
    cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
    
    // Save the cart
    await cart.save();
    console.log(`Cart saved successfully with ${cart.items.length} items`);
    console.log(`Cart total items: ${cart.totalItems}, total amount: ${cart.totalAmount}`);
    
    // Return the updated cart data
    return res.status(200).json({
      status: 'success',
      message: 'Item added to cart successfully',
      data: {
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount,
        items: cart.items
      }
    });
  } catch (error) {
    console.error('Error in direct insert endpoint:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

// All cart routes require authentication
router.use(protect);

// Main cart routes
router.route('/')
  .get(getCart)        // Get user's cart
  .post(addToCart)     // Add item to cart
  .delete(clearCart);  // Clear all items from cart

// Individual item routes
router.route('/:productId')
  .put(updateCartItem)    // Update item quantity
  .delete(removeFromCart); // Remove item from cart

// Additional cart features
router.post('/coupon', applyCoupon);       // Apply coupon code
router.post('/shipping', calculateShipping); // Calculate shipping cost

// Get lightweight version of cart data (optimized for payment)
router.get('/lightweight', getLightweightCartData);

export default router; 