const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart by user ID
exports.getCartByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    let cart = await Cart.findOne({ user: userId }).populate('products.product');
    
    if (!cart) {
      // Create empty cart if not exists
      cart = new Cart({
        user: userId,
        products: [],
        totalPrice: 0
      });
      await cart.save();
    }
    
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    
    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [],
        totalPrice: 0
      });
    }
    
    // Check if product already in cart
    const existingProductIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    
    if (existingProductIndex > -1) {
      // Update quantity if product already in cart
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      // Add new product to cart
      cart.products.push({
        product: productId,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity
      });
    }
    
    // Calculate total price
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart with populated products
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    
    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Find product in cart
    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    
    // Update quantity or remove if quantity is 0
    if (quantity <= 0) {
      cart.products.splice(productIndex, 1);
    } else {
      cart.products[productIndex].quantity = quantity;
    }
    
    // Recalculate total price
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart with populated products
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    
    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Remove product from cart
    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );
    
    // Recalculate total price
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Save cart
    await cart.save();
    
    // Return updated cart with populated products
    const updatedCart = await Cart.findById(cart._id).populate('products.product');
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    // Clear cart
    cart.products = [];
    cart.totalPrice = 0;
    
    // Save cart
    await cart.save();
    
    res.status(200).json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 