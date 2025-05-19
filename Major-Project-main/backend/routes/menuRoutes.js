import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMenuCategories } from '../controllers/menuItemController.js';

const router = express.Router();

// Route to get menu categories - for backward compatibility with frontend
router.route('/categories')
  .get(protect, getMenuCategories);

export default router; 