import express from 'express';
import {
  getPaymentTransactions,
  getPaymentTransaction,
  createPaymentTransaction,
  updateTransactionStatus,
  getPaymentSummary
} from '../controllers/paymentTransactionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Seller routes
router.get('/', restrictTo('seller'), getPaymentTransactions);
router.get('/summary', restrictTo('seller'), getPaymentSummary);
router.get('/:id', restrictTo('seller', 'admin'), getPaymentTransaction);

// Admin only routes
router.post('/', restrictTo('admin'), createPaymentTransaction);
router.put('/:id/status', restrictTo('admin'), updateTransactionStatus);

export default router; 