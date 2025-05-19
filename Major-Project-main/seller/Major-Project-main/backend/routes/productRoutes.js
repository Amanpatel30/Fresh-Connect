import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getLowStockProducts,
  getProductStats
} from '../controllers/productController.js';

const router = express.Router();

// Public routes - accessible without authentication
router.get('/', getProducts);
router.get('/:id', getProduct);

// Special routes with specific functionality
router.get('/stats/low-stock', protect, getLowStockProducts);
router.get('/stats/overview', protect, getProductStats);

// Protected routes - require authentication
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

export default router; 