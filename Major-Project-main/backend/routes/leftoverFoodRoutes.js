import express from 'express';
import {
  createListing,
  getListings,
  getMyListings,
  getListing,
  updateListing,
  deleteListing,
  updateListingStatus,
  reserveLeftoverFood
} from '../controllers/leftoverFoodController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Debug route stack
console.log('Registering leftover food routes...');

// Public routes
router.get('/', getListings);
console.log('Registered GET / route');

// Protected routes - regular users
router.post('/:id/reserve', protect, reserveLeftoverFood);

// Protected routes - hotel owners only
router.post('/', protect, restrictTo('hotel'), createListing);
router.get('/my-listings', protect, restrictTo('hotel'), getMyListings);
router.put('/:id', protect, restrictTo('hotel'), updateListing);
router.delete('/:id', protect, restrictTo('hotel'), deleteListing);
router.patch('/:id/status', protect, restrictTo('hotel'), updateListingStatus);

console.log('Leftover food routes registered successfully');

export default router; 