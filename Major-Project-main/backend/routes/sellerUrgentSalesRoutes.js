import express from 'express';
import * as urgentSaleController from '../controllers/sellerUrgentSaleController.js';
import { protect, sellerOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Apply seller protection middleware to all routes
router.use(protect);
router.use(sellerOnly);

// Routes for seller urgent sales
router.route('/')
  .get(urgentSaleController.getSellerUrgentSales)
  .post(upload.single('image'), urgentSaleController.createUrgentSale);

router.route('/:id')
  .get(urgentSaleController.getUrgentSaleById)
  .put(upload.single('image'), urgentSaleController.updateUrgentSale)
  .delete(urgentSaleController.deleteUrgentSale);

export default router; 