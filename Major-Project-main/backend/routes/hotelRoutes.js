import express from 'express';
import {
  authHotel,
  registerHotel,
  getHotelProfile,
  updateHotelProfile,
  getHotelDashboard,
  uploadVerificationDocuments,
  checkHotelEmail,
  getVerifiedHotels,
  getHotelById
} from '../controllers/hotelController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getVerifiedHotels)
  .post(registerHotel);
  
router.post('/login', authHotel);
router.post('/check-email', checkHotelEmail);
router
  .route('/profile')
  .get(protect, getHotelProfile)
  .put(protect, updateHotelProfile);
router.route('/dashboard').get(protect, getHotelDashboard);
router.route('/verification').post(protect, uploadVerificationDocuments);

// Add route to get hotel by ID
router.route('/:id').get(getHotelById);

export default router; 