import express from 'express';
import {
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../controllers/paymentMethodController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(restrictTo('seller'));

// Routes
router.route('/')
  .get(getPaymentMethods)
  .post(createPaymentMethod);

router.route('/:id')
  .get(getPaymentMethod)
  .put(updatePaymentMethod)
  .delete(deletePaymentMethod);

router.route('/:id/default')
  .put(setDefaultPaymentMethod);

export default router; 