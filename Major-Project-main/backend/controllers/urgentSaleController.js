import asyncHandler from 'express-async-handler';
import UrgentSale from '../models/UrgentSale.js';
import mongoose from 'mongoose';
import saleTransactionService from '../services/saleTransactionService.js';

// @desc    Get all urgent sales
// @route   GET /api/urgent-sales
// @access  Public
const getUrgentSales = asyncHandler(async (req, res) => {
  try {
    const urgentSales = await UrgentSale.find({status: 'active'})
    .sort({ createdAt: -1 });

    // Calculate stats for the dashboard from transactions, not product data
    // This ensures revenue calculations are based on actual sale prices
    const stats = await saleTransactionService.calculateRevenue(null);
    
    // Count products expiring soon (within 2 days)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const expiringSoon = await UrgentSale.countDocuments({
      status: 'active',
      expiryDate: { $lte: twoDaysFromNow, $gte: new Date() }
    });
    
    // Add expiring soon count to stats
    const finalStats = {
      ...stats,
      expiringSoon
    };
    
    res.json({
      status: 'success',
      data: {
        urgentSales,
        stats: finalStats
      }
    });
  } catch (error) {
    console.error('Error fetching urgent sales:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch urgent sales',
      error: error.message
    });
  }
});

// @desc    Get urgent sales for a specific seller
// @route   GET /api/seller/urgent-sales
// @access  Private (Seller only)
const getSellerUrgentSales = asyncHandler(async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const urgentSales = await UrgentSale.find({ seller: sellerId })
    .sort({ createdAt: -1 });

    // Get accurate sales stats from transaction records
    const stats = await saleTransactionService.calculateRevenue(sellerId);
    
    // Count products expiring soon (within 2 days)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    
    const expiringSoon = await UrgentSale.countDocuments({
      seller: sellerId,
      status: 'active',
      expiryDate: { $lte: twoDaysFromNow, $gte: new Date() }
    });
    
    // Add expiring soon count to stats
    const finalStats = {
      ...stats,
      expiringSoon
    };
    
    res.json({
      status: 'success',
      data: {
        urgentSales,
        stats: finalStats
      }
    });
  } catch (error) {
    console.error('Error fetching seller urgent sales:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch seller urgent sales',
      error: error.message
    });
  }
});

// @desc    Get single urgent sale
// @route   GET /api/urgent-sales/:id
// @access  Public
const getUrgentSaleById = asyncHandler(async (req, res) => {
  try {
    const urgentSale = await UrgentSale.findById(req.params.id);

  if (!urgentSale) {
    res.status(404);
    throw new Error('Urgent sale not found');
  }

    // Increment view count
    urgentSale.views += 1;
    await urgentSale.save();
    
    res.json({
      status: 'success',
      data: urgentSale
    });
  } catch (error) {
    console.error(`Error fetching urgent sale ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Failed to fetch urgent sale',
      error: error.message
    });
  }
});

// @desc    Create a new urgent sale
// @route   POST /api/urgent-sales
// @access  Private (Seller only)
const createUrgentSale = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountedPrice,
      discount,
      quantity,
      unit,
      expiryDate,
      image,
      featured,
      tags,
      status
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !category || !price || !discountedPrice || !quantity || !unit || !expiryDate || !image) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }
    
    // Validate price and discount
    if (parseFloat(discountedPrice) >= parseFloat(price)) {
      res.status(400);
      throw new Error('Discounted price must be less than original price');
    }
    
    // Create new urgent sale with the seller ID from authenticated user
    const urgentSale = await UrgentSale.create({
      seller: req.user._id,
      name,
      description,
      category,
      price: parseFloat(price),
      discountedPrice: parseFloat(discountedPrice),
      discount: parseFloat(discount),
      quantity: parseInt(quantity),
      unit,
      expiryDate,
      image,
      featured: featured || false,
      tags: tags || [],
      status: status || 'active'
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Urgent sale created successfully',
      data: {
        urgentSale
      }
    });
  } catch (error) {
    console.error('Error creating urgent sale:', error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Failed to create urgent sale',
      error: error.message
    });
  }
});

// @desc    Update an urgent sale
// @route   PUT /api/urgent-sales/:id
// @access  Private (Seller only)
const updateUrgentSale = asyncHandler(async (req, res) => {
  try {
    const urgentSale = await UrgentSale.findById(req.params.id);
    
    if (!urgentSale) {
      res.status(404);
      throw new Error('Urgent sale not found');
    }
    
    // Check if the authenticated user is the owner of this urgent sale
    if (urgentSale.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('You are not authorized to update this urgent sale');
    }
    
    // Update the urgent sale
    const updatedUrgentSale = await UrgentSale.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      status: 'success',
      message: 'Urgent sale updated successfully',
      data: updatedUrgentSale
    });
  } catch (error) {
    console.error(`Error updating urgent sale ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Failed to update urgent sale',
      error: error.message
    });
  }
});

// @desc    Delete an urgent sale
// @route   DELETE /api/urgent-sales/:id
// @access  Private (Seller only)
const deleteUrgentSale = asyncHandler(async (req, res) => {
  try {
    console.log(`Received request to delete urgent sale with ID: ${req.params.id}`);
  
  const urgentSale = await UrgentSale.findById(req.params.id);
  
  if (!urgentSale) {
      console.log(`Urgent sale with ID ${req.params.id} not found`);
    res.status(404);
    throw new Error('Urgent sale not found');
  }
  
    // Check if the authenticated user is the owner of this urgent sale
    if (req.user && urgentSale.seller.toString() !== req.user._id.toString()) {
      console.log(`User ${req.user._id} is not authorized to delete urgent sale ${req.params.id}`);
    res.status(403);
      throw new Error('You are not authorized to delete this urgent sale');
    }
    
    // Delete the urgent sale
    await UrgentSale.findByIdAndDelete(req.params.id);
    console.log(`Successfully deleted urgent sale with ID: ${req.params.id}`);
    
    res.json({
      status: 'success',
      message: `Urgent sale with ID ${req.params.id} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting urgent sale ${req.params.id}:`, error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Failed to delete urgent sale',
      error: error.message
    });
  }
});

// @desc    Mark a product as sold and record the transaction
// @route   POST /api/urgent-sales/:id/sell
// @access  Private
const markAsSold = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    
    // Use the transaction service to record sale with current price values
    const transaction = await saleTransactionService.recordSaleTransaction(id, quantity);
    
    res.json({
      status: 'success',
      message: 'Product marked as sold and transaction recorded',
      data: {
        transaction
      }
    });
  } catch (error) {
    console.error(`Error marking product ${req.params.id} as sold:`, error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Failed to mark product as sold',
      error: error.message
    });
  }
});

// Use ES Module export syntax
export {
  getUrgentSales,
  getSellerUrgentSales,
  getUrgentSaleById,
  createUrgentSale,
  updateUrgentSale,
  deleteUrgentSale,
  markAsSold
}; 