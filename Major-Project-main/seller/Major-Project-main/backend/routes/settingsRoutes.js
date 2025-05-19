import express from 'express';
import {
  getSettings,
  updateGeneralSettings,
  updateNotificationSettings,
  updateSecuritySettings,
  resetSettings
} from '../controllers/settingsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes - only authenticated users can access
router.use(protect);

// Restrict to seller role
router.use(restrictTo('seller'));

// Routes for /api/seller/settings
router.route('/')
  .get(getSettings);

// Route for updating general settings
router.route('/general')
  .put(updateGeneralSettings);

// Route for updating notification settings
router.route('/notifications')
  .put(updateNotificationSettings);

// Route for updating security settings
router.route('/security')
  .put(updateSecuritySettings);

// Route for resetting settings to default
router.route('/reset')
  .post(resetSettings);

export default router; 