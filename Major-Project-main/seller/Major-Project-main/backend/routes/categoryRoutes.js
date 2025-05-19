import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder
} from '../controllers/categoryController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes - only authenticated users can access
router.use(protect);

// Restrict to seller role
router.use(restrictTo('seller'));

// Routes for /api/seller/categories
router.route('/')
  .get(getCategories)
  .post(createCategory);

// Route for updating category order
router.route('/order')
  .put(updateCategoryOrder);

// Routes for /api/seller/categories/:id
router.route('/:id')
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

export default router; 