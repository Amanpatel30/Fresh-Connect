import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';
import errorHandler from '../utils/errorHandler.js';
import path from 'path';
import fs from 'fs';

// Get all products or filter by category
export const getProducts = catchAsync(async (req, res) => {
  console.log('Get products request received');
  const { category, search, minPrice, maxPrice } = req.query;
  
  // Build query object
  const query = {};
  
  if (category && category !== 'All Categories') {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
  }
  
  // Get user ID from authentication if available
  if (req.user) {
    query.seller = req.user._id;
  }
  
  console.log('Query:', JSON.stringify(query));
  
  // Get products
  const products = await Product.find(query).sort('-createdAt');
  console.log(`Found ${products.length} products`);
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// Get a single product
export const getProduct = catchAsync(async (req, res) => {
  console.log(`Get product request for ID: ${req.params.id}`);
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    console.log(`Product not found with ID: ${req.params.id}`);
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }
  
  console.log(`Found product: ${product.name}`);
  res.status(200).json({
    status: 'success',
    data: product
  });
});

// Create a new product
export const createProduct = catchAsync(async (req, res) => {
  console.log('=====================================================');
  console.log('CREATE PRODUCT REQUEST RECEIVED');
  console.log('=====================================================');
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Image exists in request:', !!req.body.image);
  console.log('Image length:', req.body.image ? req.body.image.length : 0);
  console.log('Auth user:', req.user);
  console.log('User ID from auth:', req.user?._id);
  
  try {
    // Add the seller ID from the authenticated user if not provided
    if (!req.body.seller && req.user) {
      req.body.seller = req.user._id;
      console.log('Added seller ID from authenticated user:', req.user._id);
    }
    
    // Validate input data
    const requiredFields = ['name', 'price', 'stock', 'category', 'description', 'image'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Validation failed: Missing required fields:', missingFields);
      return res.status(400).json({
        status: 'fail',
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }
    
    if (!req.body.image || req.body.image.length < 100) {
      console.error('Invalid image data: Image is missing or too small');
      return res.status(400).json({
        status: 'fail',
        message: 'A valid image is required for the product'
      });
    }
    
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not established. Current state:', mongoose.connection.readyState);
      return res.status(500).json({
        status: 'error',
        message: 'Database connection is not available'
      });
    }
    
    // Extract the specific fields to ensure correct structure
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      unit: req.body.unit,
      // Ensure image is stored as a string (main image)
      image: req.body.image,
      // Convert additionalImages to images array if present
      images: req.body.additionalImages || [],
      seller: req.body.seller,
      tags: req.body.tags || [],
      organic: req.body.organic || false,
      harvestDate: req.body.harvestDate,
      expiryDate: req.body.expiryDate,
      nutritionalInfo: req.body.nutritionalInfo
    };
    
    console.log('Creating product with structured data (image exists):', !!productData.image);
    
    // Create new product with the explicitly structured data
    const product = await Product.create(productData);
    console.log('Product created successfully:', product._id);
    console.log('Product has image field:', !!product.image);
    
    res.status(201).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: messages
      });
    }
    
    // Check for MongoDB connection error
    if (error.name === 'MongooseServerSelectionError') {
      console.error('MongoDB connection error');
      return res.status(500).json({
        status: 'error',
        message: 'Database connection error',
        error: error.message
      });
    }
    
    // Pass other errors to the global error handler
    throw error;
  }
});

// Update a product
export const updateProduct = catchAsync(async (req, res) => {
  console.log('=====================================================');
  console.log('UPDATE PRODUCT REQUEST RECEIVED');
  console.log('=====================================================');
  console.log('Product ID:', req.params.id);
  console.log('Request body:', req.body);
  console.log('Auth user:', req.user);
  
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB connection is not established. Current state:', mongoose.connection.readyState);
      return res.status(500).json({
        status: 'error',
        message: 'Database connection is not available'
      });
    }
    
    // Find the product to update
    const productExists = await Product.findById(req.params.id);
    
    if (!productExists) {
      console.error('Product not found:', req.params.id);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Check if the user is the seller of the product
    if (req.user && productExists.seller.toString() !== req.user._id.toString()) {
      console.error('User is not authorized to update this product');
      console.error('Product seller:', productExists.seller);
      console.error('Request user:', req.user._id);
      
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this product'
      });
    }
    
    // Extract the specific fields for update to ensure correct structure
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
      unit: req.body.unit,
      // Ensure image is stored as a string
      image: req.body.image,
      // Convert additionalImages to images array if present
      images: req.body.additionalImages || [],
      tags: req.body.tags || [],
      organic: req.body.organic || false,
      nutritionalInfo: req.body.nutritionalInfo
    };
    
    // Only update expiryDate if provided
    if (req.body.expiryDate) {
      updateData.expiryDate = req.body.expiryDate;
    }
    
    // Remove undefined fields
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    console.log('Updating product with structured data:', updateData);
    
    // Update the product with the structured update data
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('Product updated successfully:', product._id);
    
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation errors:', messages);
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: messages
      });
    }
    
    // Pass other errors to the global error handler
    throw error;
  }
});

// Delete a product
export const deleteProduct = catchAsync(async (req, res) => {
  console.log(`Delete product request for ID: ${req.params.id}`);
  
  try {
    // Find the product first to verify it exists
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log(`Product not found with ID: ${req.params.id}`);
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Check if the user is the seller of this product
    if (req.user && product.seller && req.user._id.toString() !== product.seller.toString()) {
      console.log('Unauthorized delete attempt - user is not the seller');
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete this product'
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    console.log(`Product deleted successfully: ${req.params.id}`);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
});

// Get low stock products
export const getLowStockProducts = catchAsync(async (req, res) => {
  console.log('Get low stock products request');
  
  const query = { stock: { $lt: 5 } };
  
  // If authenticated, only show current user's products
  if (req.user) {
    query.seller = req.user._id;
  }
  
  const products = await Product.find(query).sort('stock');
  console.log(`Found ${products.length} low stock products`);
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: products
  });
});

// Get product statistics for seller dashboard
export const getProductStats = async (req, res) => {
  try {
    console.log('Getting product statistics for seller dashboard');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to access this resource'
      });
    }
    
    const sellerId = req.user._id;
    
    // Get total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    
    // Get products by status
    const activeProducts = await Product.countDocuments({ 
      seller: sellerId, 
      status: 'active' 
    });
    
    // Get low stock products count
    const lowStockProducts = await Product.countDocuments({ 
      seller: sellerId,
      stock: { $lt: 5, $gt: 0 }
    });
    
    // Get out of stock products count
    const outOfStockProducts = await Product.countDocuments({ 
      seller: sellerId,
      stock: 0
    });
    
    // Get top selling products
    const topSellingProducts = await Product.find({ seller: sellerId })
      .sort({ salesCount: -1 })
      .limit(5);
    
    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(sellerId) } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Convert category data for pie chart
    const inventoryData = productsByCategory.map(category => ({
      name: category._id || 'Other',
      value: category.count
    }));
    
    // If no categories found, add some default categories to show in the pie chart
    if (inventoryData.length === 0) {
      console.log('No product categories found, creating default categories');
      
      // Create categories from existing products if we have some products with categories
      const allCategories = await Product.distinct('category', { seller: sellerId });
      
      // If we have some categories but they weren't grouped (maybe just 1 product per category)
      if (allCategories && allCategories.length > 0) {
        console.log('Found individual categories:', allCategories);
        
        // Count products in each category
        for (const category of allCategories) {
          if (category) {
            const count = await Product.countDocuments({ 
              seller: sellerId, 
              category: category 
            });
            
            if (count > 0) {
              inventoryData.push({
                name: category,
                value: count
              });
            }
          }
        }
      }
      
      // If still no categories, create some based on total products
      if (inventoryData.length === 0 && totalProducts > 0) {
        // First create "Uncategorized" for all products
        inventoryData.push(
          { name: 'Uncategorized', value: totalProducts }
        );
        
        // Also add some sample categories for visualization
        const sampleCategoryCount = Math.ceil(totalProducts / 4);
        inventoryData.push(
          { name: 'Vegetables', value: sampleCategoryCount },
          { name: 'Fruits', value: sampleCategoryCount },
          { name: 'Dairy', value: sampleCategoryCount },
          { name: 'Other', value: totalProducts - (sampleCategoryCount * 3) }
        );
      }
    }
    
    // Return response directly
    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        topSellingProducts,
        productsByCategory,
        inventoryData
      }
    });
  } catch (error) {
    console.error('Error getting product stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get featured products
export const getFeaturedProducts = catchAsync(async (req, res) => {
  console.log('Getting featured products');
  
  const query = { isFeatured: true };
  
  // Add seller filter if user is authenticated
  if (req.user) {
    query.seller = req.user._id;
  }
  
  const featuredProducts = await Product.find(query)
    .sort('-createdAt')
    .limit(10);
  
  res.status(200).json({
    status: 'success',
    results: featuredProducts.length,
    data: featuredProducts
  });
});

// Toggle featured status
export const toggleFeaturedStatus = catchAsync(async (req, res) => {
  console.log(`Toggle featured status for product ID: ${req.params.id}`);
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }
  
  // Check if user is the seller of this product
  if (req.user && product.seller && product.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: 'fail',
      message: 'You are not authorized to update this product'
    });
  }
  
  // Toggle the featured status
  product.isFeatured = !product.isFeatured;
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: product
  });
});

// Bulk update products
export const bulkUpdateProducts = catchAsync(async (req, res) => {
  console.log('Bulk update products request received');
  
  const { productIds, updateData } = req.body;
  
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product IDs array is required'
    });
  }
  
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Update data is required'
    });
  }
  
  // Ensure user can only update their own products
  const query = { 
    _id: { $in: productIds } 
  };
  
  if (req.user) {
    query.seller = req.user._id;
  }
  
  const result = await Product.updateMany(query, { $set: updateData });
  
  res.status(200).json({
    status: 'success',
    message: `${result.nModified} products updated successfully`,
    data: result
  });
});

// Add a review to a product
export const addProductReview = catchAsync(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      status: 'fail',
      message: 'Product not found'
    });
  }

  // Check if user has already reviewed
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product already reviewed'
    });
  }

  const review = {
    user: req.user._id,
    rating: Number(rating),
    comment
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    status: 'success',
    message: 'Review added'
  });
});

// Get all products for a seller
export const getSellerProducts = catchAsync(async (req, res) => {
  const sellerId = req.user._id;
  
  // Build query
  const query = { seller: sellerId };
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by category if provided
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Search by name if provided
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }
  
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Execute query
  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Get total count
  const total = await Product.countDocuments(query);
  
  // Pagination result
  const pagination = {
    total,
    pages: Math.ceil(total / limit),
    page,
    limit
  };
  
  res.status(200).json({
    status: 'success',
    count: products.length,
    pagination,
    data: products
  });
});

// Upload product images
export const uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if the product belongs to the logged-in seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }
    
    const files = req.files.images;
    const images = [];
    
    // Handle single file upload
    if (!Array.isArray(files)) {
      const file = files;
      
      // Check file type
      if (!file.mimetype.startsWith('image')) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }
      
      // Check file size
      if (file.size > 1000000) { // 1MB
        return res.status(400).json({
          success: false,
          message: 'Image size should be less than 1MB'
        });
      }
      
      // Create custom filename
      const filename = `product_${product._id}_${Date.now()}${path.extname(file.name)}`;
      
      // Move file to upload directory
      file.mv(`./uploads/${filename}`, async err => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: 'Problem with file upload'
          });
        }
        
        // Add filename to images array
        images.push(filename);
        
        // Update product with new images
        product.images = [...product.images, ...images];
        await product.save();
        
        res.status(200).json({
          success: true,
          data: product
        });
      });
    } else {
      // Handle multiple file upload
      const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
          // Check file type
          if (!file.mimetype.startsWith('image')) {
            reject('Please upload image files only');
            return;
          }
          
          // Check file size
          if (file.size > 1000000) { // 1MB
            reject('Image size should be less than 1MB');
            return;
          }
          
          // Create custom filename
          const filename = `product_${product._id}_${Date.now()}${path.extname(file.name)}`;
          
          // Move file to upload directory
          file.mv(`./uploads/${filename}`, err => {
            if (err) {
              reject(err);
              return;
            }
            
            // Add filename to images array
            resolve(filename);
          });
        });
      });
      
      try {
        const uploadedImages = await Promise.all(uploadPromises);
        
        // Update product with new images
        product.images = [...product.images, ...uploadedImages];
        await product.save();
        
        res.status(200).json({
          success: true,
          data: product
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error
        });
      }
    }
  } catch (error) {
    errorHandler(error, req, res);
  }
}; 