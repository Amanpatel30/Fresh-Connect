import express from 'express';
import {
  getUrgentSales,
  getSellerUrgentSales,
  getUrgentSaleById,
  createUrgentSale,
  updateUrgentSale,
  deleteUrgentSale,
  markAsSold
} from '../controllers/urgentSaleController.js';
import { protect, restrictTo, sellerProtect, sellerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Log all incoming requests to this router for debugging
router.use((req, res, next) => {
  console.log(`🔍 [UrgentSaleRoutes] ${req.method} ${req.originalUrl}, User: ${req.user ? req.user._id : 'Not authenticated'}`);
  next();
});

// Public routes
router.get('/', getUrgentSales);

// Pattern matching routes
router.get('/:id', getUrgentSaleById);

// Protected routes
router.use(protect);

// Seller only routes
router.route('/seller')
  .get(sellerOnly, getSellerUrgentSales)
  .post(sellerOnly, createUrgentSale);

router.route('/seller/:id')
  .get(sellerOnly, getUrgentSaleById)
  .put(sellerOnly, updateUrgentSale)
  .patch(sellerOnly, updateUrgentSale)
  .delete(sellerOnly, deleteUrgentSale);

// Route for marking products as sold
router.post('/:id/sell', markAsSold);

export default router; 