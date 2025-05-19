import express from 'express';
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require authentication
router.route('/')
  .get(protect, getPurchases)
  .post(protect, createPurchase);

router.route('/:id')
  .get(protect, getPurchaseById)
  .put(protect, updatePurchase)
  .delete(protect, deletePurchase);

export default router; 