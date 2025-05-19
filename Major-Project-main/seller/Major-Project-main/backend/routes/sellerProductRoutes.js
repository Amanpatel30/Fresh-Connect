import express from 'express';
import {
  getSellerProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getProductStats
} from '../controllers/productController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(restrictTo('seller'));

// Routes
router.route('/')
  .get(getSellerProducts)
  .post(createProduct);

router.route('/stats')
  .get(getProductStats);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

router.route('/:id/images')
  .post(uploadProductImages);

export default router; 