import express from 'express';
import {
  getSellerOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getPendingOrders,
  getShippingOrders
} from '../controllers/orderController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(restrictTo('seller'));

// Routes
router.route('/')
  .get(getSellerOrders);

router.route('/stats')
  .get(getOrderStats);

router.route('/pending')
  .get(getPendingOrders);

router.route('/shipping')
  .get(getShippingOrders);

router.route('/:id')
  .get(getOrder);

router.route('/:id/status')
  .put(updateOrderStatus);

export default router; 