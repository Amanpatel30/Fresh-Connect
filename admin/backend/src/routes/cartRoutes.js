const express = require('express');
const router = express.Router();
const {
  getCartByUser,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

// Get cart by user ID
router.route('/user/:userId')
  .get(getCartByUser);

// Add product to cart
router.route('/add')
  .post(addToCart);

// Update cart item
router.route('/update')
  .put(updateCartItem);

// Remove item from cart
router.route('/remove/:userId/:productId')
  .delete(removeFromCart);

// Clear cart
router.route('/clear/:userId')
  .delete(clearCart);

module.exports = router; 