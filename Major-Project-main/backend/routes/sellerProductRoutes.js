import express from 'express';
import * as productController from '../controllers/sellerProductController.js';
import { protect, sellerOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Apply seller protection middleware to all routes
router.use(protect);
router.use(sellerOnly);

// Routes for seller products
router.route('/')
  .get(productController.getSellerProducts)
  .post(upload.single('image'), productController.createProduct);

router.route('/:id')
  .get(productController.getProduct)
  .put(upload.single('image'), productController.updateProduct)
  .delete(productController.deleteProduct);

export default router; 