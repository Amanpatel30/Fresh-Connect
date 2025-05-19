import express from 'express';
import { protect, seller } from '../middleware/authMiddleware.js';
import * as urgentSalesController from '../controllers/urgentSalesController.js';

const router = express.Router();

// Routes are registered with appropriate prefixes in server.js

// @route   GET /
// @desc    Get all urgent sales for the logged-in seller
// @access  Private (seller only)
router.get('/', protect, seller, urgentSalesController.getUrgentSales);

// @route   GET /:id
// @desc    Get a single urgent sale by ID
// @access  Private (seller only)
router.get('/:id', protect, seller, urgentSalesController.getUrgentSaleById);

// @route   POST /
// @desc    Create a new urgent sale
// @access  Private (seller only)
router.post('/', protect, seller, urgentSalesController.createUrgentSale);

// @route   PUT /:id
// @desc    Update an urgent sale
// @access  Private (seller only)
router.put('/:id', protect, seller, urgentSalesController.updateUrgentSale);

// @route   DELETE /:id
// @desc    Delete an urgent sale
// @access  Private (seller only)
router.delete('/:id', protect, seller, urgentSalesController.deleteUrgentSale);

// @route   PATCH /:id/featured
// @desc    Toggle featured status
// @access  Private (seller only)
router.patch('/:id/featured', protect, seller, urgentSalesController.toggleFeatured);

// @route   PATCH /:id/status
// @desc    Toggle active/inactive status
// @access  Private (seller only)
router.patch('/:id/status', protect, seller, urgentSalesController.toggleStatus);

export default router; 