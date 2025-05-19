import express from 'express';
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
  getMenuCategories,
  getMenuItemsByHotel
} from '../controllers/menuItemController.js';
import { protect } from '../middleware/authMiddleware.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

router.route('/')
  .post(protect, createMenuItem)
  .get(protect, getMenuItems);

// Use the proper controller method for categories
router.route('/categories')
  .get(protect, getMenuCategories);

// Public endpoint to get menu items by hotel ID - no authentication required
router.route('/hotel/:hotelId')
  .get(getMenuItemsByHotel);

router.route('/:id')
  .get(protect, getMenuItemById)
  .put(protect, updateMenuItem)
  .delete(protect, deleteMenuItem);

router.route('/category/:category')
  .get(protect, getMenuItemsByCategory);

export default router; 