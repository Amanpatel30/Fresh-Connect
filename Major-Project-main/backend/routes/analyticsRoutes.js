import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getSalesAnalytics, 
  getCustomerAnalytics, 
  getInventoryAnalytics 
} from '../controllers/analyticsController.js';

const router = express.Router();

// Analytics routes
router.get('/sales', protect, getSalesAnalytics);
router.get('/customers', protect, getCustomerAnalytics);
router.get('/inventory', protect, getInventoryAnalytics);

export default router; 