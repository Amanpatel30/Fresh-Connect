const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
} = require('../controllers/productController');

// Get all products and create product
router.route('/')
  .get(getProducts)
  .post(createProduct);

// Get featured products
router.route('/featured')
  .get(getFeaturedProducts);

// Get, update and delete product by ID
router.route('/:id')
  .get(getProductById)
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router; 