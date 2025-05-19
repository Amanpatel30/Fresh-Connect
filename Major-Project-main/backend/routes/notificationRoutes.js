import express from 'express';
import { 
  getNotifications, 
  getAllNotifications,
  markAsRead, 
  markAllAsRead,
  createNotification,
  deleteNotification 
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification);

// Test route to get all notifications regardless of user
router.route('/all')
  .get(protect, getAllNotifications);

router.route('/:id')
  .delete(protect, deleteNotification);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/read-all')
  .put(protect, markAllAsRead);

export default router; 