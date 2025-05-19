const express = require('express');
const router = express.Router();
const { 
  getAllSellers,
  getSellerById,
  updateSellerStatus,
  getSellerStats
} = require('../controllers/sellerController');

// Get all sellers
router.route('/')
  .get(getAllSellers);

// Get seller statistics
router.route('/stats')
  .get(getSellerStats);

// Get, update seller by ID
router.route('/:id')
  .get(getSellerById)
  .put(updateSellerStatus);

module.exports = router; 