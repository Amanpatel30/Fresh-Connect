import express from 'express';
import {
  getUrgentSales,
  getUrgentSale,
  createUrgentSale,
  updateUrgentSale,
  deleteUrgentSale,
  toggleFeatured,
  toggleStatus
} from '../controllers/urgentSaleController.js';
import { protect, seller } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(seller);

// Routes for /api/urgent-sales
router.route('/')
  .get(getUrgentSales)
  .post(createUrgentSale);

// Routes for /api/urgent-sales/:id
router.route('/:id')
  .get(getUrgentSale)
  .put(updateUrgentSale)
  .delete(deleteUrgentSale);

// Route for toggling featured status
router.patch('/:id/featured', toggleFeatured);

// Route for toggling active/inactive status
router.patch('/:id/status', toggleStatus);

export default router; 