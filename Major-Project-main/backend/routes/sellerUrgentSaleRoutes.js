const express = require('express');
const router = express.Router();
const { protect, sellerProtect } = require('../middleware/authMiddleware');
const {
  getSellerUrgentSales,
  getUrgentSaleById,
  createUrgentSale,
  updateUrgentSale,
  deleteUrgentSale
} = require('../controllers/urgentSaleController');

// Protected routes (seller only)
router.get('/', protect, sellerProtect, getSellerUrgentSales);
router.get('/:id', protect, sellerProtect, getUrgentSaleById);
router.post('/', protect, sellerProtect, createUrgentSale);
router.put('/:id', protect, sellerProtect, updateUrgentSale);
router.patch('/:id', protect, sellerProtect, updateUrgentSale);
router.delete('/:id', protect, sellerProtect, deleteUrgentSale);

module.exports = router; 
const router = express.Router();
const { protect, sellerProtect } = require('../middleware/authMiddleware');
const {
  getSellerUrgentSales,
  getUrgentSaleById,
  createUrgentSale,
  updateUrgentSale,
  deleteUrgentSale
} = require('../controllers/urgentSaleController');

// Protected routes (seller only)
router.get('/', protect, sellerProtect, getSellerUrgentSales);
router.get('/:id', protect, sellerProtect, getUrgentSaleById);
router.post('/', protect, sellerProtect, createUrgentSale);
router.put('/:id', protect, sellerProtect, updateUrgentSale);
router.patch('/:id', protect, sellerProtect, updateUrgentSale);
router.delete('/:id', protect, sellerProtect, deleteUrgentSale);

module.exports = router; 