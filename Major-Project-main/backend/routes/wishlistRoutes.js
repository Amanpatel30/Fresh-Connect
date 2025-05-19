import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  getCollections,
  createCollection,
  moveToCollection,
  moveToCart,
  clearWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// Main wishlist routes
router.route('/')
  .get(getWishlist)
  .post(addToWishlist)
  .delete(clearWishlist);

router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);
router.post('/:productId/move-to-cart', moveToCart);

// Collection routes
router.route('/collections')
  .get(getCollections)
  .post(createCollection);

router.put('/collections/:collectionId/items', moveToCollection);

export default router; 