import express from 'express';
import * as orderController from '../controllers/sellerOrderController.js';
import { protect, sellerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply seller protection middleware to all routes
router.use(protect);
router.use(sellerOnly);

// Routes for seller orders
router.route('/')
  .get(orderController.getSellerOrders);

router.route('/pending')
  .get(orderController.getPendingOrders);

router.route('/shipping')
  .get(orderController.getShippingOrders);

// Add a dedicated stats route before the ID route
// Important: This must come before the /:id route to prevent 'stats' being treated as an ID
router.route('/stats')
  .get(orderController.getOrderStats);

// This route should now only match actual order IDs
router.route('/:id')
  .get(orderController.getOrder);

// Add dedicated status update endpoint
router.route('/:id/status')
  .patch(orderController.updateOrderStatus);

export default router; 