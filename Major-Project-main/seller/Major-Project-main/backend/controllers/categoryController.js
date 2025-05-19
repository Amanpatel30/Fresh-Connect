import Category from '../models/Category.js';
import { errorHandler } from '../utils/errorHandler.js';
import mongoose from 'mongoose';

// @desc    Get all categories
// @route   GET /api/seller/categories
// @access  Private/Seller
export const getCategories = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const categories = await Category.find({ seller: sellerId })
      .sort({ order: 1 });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Get a single category
// @route   GET /api/seller/categories/:id
// @access  Private/Seller
export const getCategory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const categoryId = req.params.id;
    
    const category = await Category.findOne({ 
      _id: categoryId, 
      seller: sellerId 
    });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Create a new category
// @route   POST /api/seller/categories
// @access  Private/Seller
export const createCategory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { name, color } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }
    
    // Get the maximum order value to place new category at the end
    const maxOrderCategory = await Category.findOne({ seller: sellerId })
      .sort({ order: -1 });
    
    const newOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 0;
    
    const newCategory = await Category.create({
      name,
      color: color || '#4caf50',
      seller: sellerId,
      order: newOrder
    });
    
    res.status(201).json({
      success: true,
      data: newCategory
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Update a category
// @route   PUT /api/seller/categories/:id
// @access  Private/Seller
export const updateCategory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const categoryId = req.params.id;
    const { name, color } = req.body;
    
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: categoryId, seller: sellerId },
      { name, color },
      { new: true, runValidators: true }
    );
    
    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Delete a category
// @route   DELETE /api/seller/categories/:id
// @access  Private/Seller
export const deleteCategory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const categoryId = req.params.id;
    
    const deletedCategory = await Category.findOneAndDelete({
      _id: categoryId,
      seller: sellerId
    });
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Update category order
// @route   PUT /api/seller/categories/order
// @access  Private/Seller
export const updateCategoryOrder = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { categoryIds } = req.body;
    
    if (!categoryIds || !Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'Category IDs array is required'
      });
    }
    
    // Update each category with its new order
    const updatePromises = categoryIds.map((id, index) => {
      return Category.findOneAndUpdate(
        { _id: id, seller: sellerId },
        { order: index },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
}; 