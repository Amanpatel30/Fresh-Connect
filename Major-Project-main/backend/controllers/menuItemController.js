import asyncHandler from 'express-async-handler';
import MenuItem from '../models/MenuItem.js';
import UrgentSale from '../models/UrgentSale.js';

// @desc    Create a new menu item
// @route   POST /api/menu-items
// @access  Private
const createMenuItem = asyncHandler(async (req, res) => {
  console.log('Creating menu item with data:', {
    ...req.body,
    image: req.body.image ? `${req.body.image.substring(0, 30)}... (${req.body.image.length} chars)` : 'none'
  });
  console.log('User/Hotel info:', req.user ? JSON.stringify(req.user, null, 2) : 'No user data');

  const {
    name,
    description,
    price,
    image,
    category,
    isVegetarian,
    isVegan,
    isGlutenFree,
    ingredients,
    nutritionalInfo,
    preparationTime,
  } = req.body;

  // Log specific image data for debugging
  console.log('⭐ Received image data type:', typeof image);
  
  // Log more details about the image
  if (image) {
    console.log(`⭐ Image URL type: ${typeof image}`);
    console.log(`⭐ Image URL length: ${image.length}`);
    console.log(`⭐ Image URL starts with: ${image.substring(0, 30)}...`);
    console.log(`⭐ Is data URI: ${image.startsWith('data:')}`);
    
    // Check data URI format
    if (image.startsWith('data:')) {
      const parts = image.split(',');
      console.log(`⭐ Data URI header: ${parts[0]}`);
      console.log(`⭐ Data URI has valid format: ${image.includes('base64,')}`);
    }
  } else {
    console.log('⭐ No image URL provided in request body');
  }

  // Use req.user.id instead of req.hotel._id for compatibility with frontend
  const hotelId = req.user?.id || req.user?._id || req.hotel?._id;
  
  console.log('Hotel ID extracted:', hotelId);
  
  if (!hotelId) {
    console.error('Hotel ID not found in request');
    return res.status(400).json({ message: 'Hotel ID not found in request' });
  }

  try {
    // Validate required fields
    const validationErrors = {};
    
    if (!name) {
      validationErrors.name = 'Name is required';
    }
    
    if (!description) {
      validationErrors.description = 'Description is required';
    }
    
    if (!price || isNaN(parseFloat(price))) {
      validationErrors.price = 'Valid price is required';
    }
    
    // Make category check case-insensitive and more flexible
    if (!category) {
      validationErrors.category = 'Category is required';
    }
    
    // If we have validation errors, return them all at once
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    // Process the image - handle data URIs specially
    let processedImage = '';
    if (image) {
      // For a data URI, keep it as is but check if it's valid
      if (image.startsWith('data:')) {
        console.log('⭐ Using data URI directly in menu item');
        // Validate if it's a proper data URI
        if (image.includes('base64,')) {
          console.log('⭐ Valid data URI format detected');
          processedImage = image;
          
          // Check if URI is too large (over 8MB)
          if (image.length > 8 * 1024 * 1024) {
            console.log('⭐ Data URI is extremely large:', Math.round(image.length / (1024 * 1024)), 'MB');
            return res.status(400).json({ 
              message: 'Image data too large',
              details: 'Image data exceeds the maximum allowed size of 8MB'
            });
          }
        } else {
          console.log('⭐ Invalid data URI format, using empty string');
          return res.status(400).json({ 
            message: 'Invalid data URI format',
            details: 'The image data URI is not properly formatted. It should start with "data:" and include "base64,"'
          });
        }
      } 
      // For URL, validate it
      else if (image.startsWith('http') || image.startsWith('/') || image.includes('/api/')) {
        console.log('⭐ Using URL in menu item');
        processedImage = image;
      } else {
        console.log('⭐ Unrecognized image format:', image.substring(0, 30), '...');
        return res.status(400).json({ 
          message: 'Invalid image format',
          details: 'Image must be a valid URL or data URI'
        });
      }
    }
    
    // Create menu item with validated data - EXPLICITLY SET IMAGE
    const menuItem = new MenuItem({
      hotel: hotelId,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image: processedImage, // Use processed image
      category: category.trim(),
      isVegetarian: isVegetarian === true || isVegetarian === 'true',
      isVegan: isVegan === true || isVegan === 'true',
      isGlutenFree: isGlutenFree === true || isGlutenFree === 'true',
      ingredients: ingredients || [],
      nutritionalInfo: nutritionalInfo || {},
      preparationTime: preparationTime ? parseInt(preparationTime) : 15,
    });

    console.log('Menu item to save:', {
      ...menuItem.toObject(),
      image: menuItem.image ? `Image: ${menuItem.image.substring(0, 30)}... (${menuItem.image.length} chars)` : 'No image'
    });
    
    try {
      const createdMenuItem = await menuItem.save();
      console.log('Menu item created successfully:', createdMenuItem._id);
      res.status(201).json(createdMenuItem);
    } catch (dbError) {
      console.error('Database error creating menu item:', dbError);
      
      // Check for MongoDB validation errors
      if (dbError.name === 'ValidationError') {
        const validationErrors = {};
        
        // Extract validation error messages
        for (const field in dbError.errors) {
          validationErrors[field] = dbError.errors[field].message;
        }
        
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: validationErrors 
        });
      }
      
      // Check for duplicate key error
      if (dbError.code === 11000) {
        console.error('Duplicate key error:', dbError.keyValue);
        return res.status(400).json({ 
          message: 'Duplicate key error', 
          error: dbError.keyValue,
          details: `A menu item with this ${Object.keys(dbError.keyValue).join(', ')} already exists`
        });
      }
      
      // Other MongoDB errors
      throw dbError;
    }
  } catch (error) {
    console.error('Error creating menu item:', error);
    
    // Return a detailed error for 500 status
    res.status(500).json({ 
      message: 'Error creating menu item', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get all menu items for a hotel
// @route   GET /api/menu-items
// @access  Private
const getMenuItems = asyncHandler(async (req, res) => {
  // Extract pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  
  console.log(`Getting menu items - Page: ${page}, Limit: ${limit}`);
  console.log('User data:', req.user);
  
  // Use req.user.id instead of req.hotel._id for compatibility with frontend
  const hotelId = req.user?.id || req.user?._id || req.hotel?._id;
  
  if (!hotelId) {
    return res.status(400).json({ message: 'Hotel ID not found in request' });
  }
  
  try {
    // Get total count for pagination
    const total = await MenuItem.countDocuments({ hotel: hotelId });
    
    // Get menu items with pagination
    const menuItems = await MenuItem.find({ hotel: hotelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Return items with pagination metadata
    res.json({
      items: menuItems,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

// @desc    Get a menu item by ID
// @route   GET /api/menu-items/:id
// @access  Private
const getMenuItemById = asyncHandler(async (req, res) => {
  // Use req.user.id instead of req.hotel._id for consistency
  const hotelId = req.user?.id || req.hotel?._id;
  
  if (!hotelId) {
    return res.status(400).json({ message: 'Hotel ID not found in request' });
  }

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  if (menuItem.hotel.toString() !== hotelId.toString()) {
    return res.status(403).json({ message: 'Not authorized to access this menu item' });
  }

  res.json(menuItem);
});

// @desc    Update a menu item
// @route   PUT /api/menu-items/:id
// @access  Private
const updateMenuItem = asyncHandler(async (req, res) => {
  console.log(`Updating menu item ID: ${req.params.id}`, {
    ...req.body,
    image: req.body.image ? `${req.body.image.substring(0, 30)}... (${req.body.image.length} chars)` : 'none'
  });

  const {
    name,
    description,
    price,
    image,
    category,
    isVegetarian,
    isVegan,
    isGlutenFree,
    isAvailable,
    ingredients,
    nutritionalInfo,
    preparationTime,
    isPopular,
  } = req.body;

  // Log specific image data for debugging if provided
  if (image) {
    console.log(`⭐ Update - Image URL type: ${typeof image}`);
    console.log(`⭐ Update - Image URL length: ${image.length}`);
    console.log(`⭐ Update - Image URL starts with: ${image.substring(0, 30)}...`);
    console.log(`⭐ Update - Is data URI: ${image.startsWith('data:')}`);
  }

  // Use req.user.id instead of req.hotel._id for consistency
  const hotelId = req.user?.id || req.hotel?._id;
  
  if (!hotelId) {
    return res.status(400).json({ message: 'Hotel ID not found in request' });
  }

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  if (menuItem.hotel.toString() !== hotelId.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this menu item' });
  }

  // Process image before updating
  let processedImage = menuItem.image; // Default to existing image
  if (image !== undefined) {
    // If image is explicitly set to empty string, clear it
    if (image === '') {
      processedImage = '';
      console.log('⭐ Clearing image in update');
    }
    // If it's a data URI, use it directly
    else if (image && image.startsWith('data:')) {
      processedImage = image;
      console.log('⭐ Using data URI in update');
    }
    // If it's a URL, validate it
    else if (image && (image.startsWith('http') || image.startsWith('/') || image.includes('/api/'))) {
      processedImage = image;
      console.log('⭐ Using URL in update:', image.substring(0, 30));
    }
    else if (image) {
      console.log('⭐ Invalid image format in update, keeping existing image');
    }
  }

  menuItem.name = name || menuItem.name;
  menuItem.description = description || menuItem.description;
  menuItem.price = price || menuItem.price;
  menuItem.image = processedImage; // Use processed image
  menuItem.category = category || menuItem.category;
  menuItem.isVegetarian = isVegetarian !== undefined ? isVegetarian : menuItem.isVegetarian;
  menuItem.isVegan = isVegan !== undefined ? isVegan : menuItem.isVegan;
  menuItem.isGlutenFree = isGlutenFree !== undefined ? isGlutenFree : menuItem.isGlutenFree;
  menuItem.isAvailable = isAvailable !== undefined ? isAvailable : menuItem.isAvailable;
  menuItem.ingredients = ingredients || menuItem.ingredients;
  menuItem.nutritionalInfo = nutritionalInfo || menuItem.nutritionalInfo;
  menuItem.preparationTime = preparationTime || menuItem.preparationTime;
  menuItem.isPopular = isPopular !== undefined ? isPopular : menuItem.isPopular;

  try {
    console.log('Menu item to update:', {
      ...menuItem.toObject(),
      image: menuItem.image ? `Image: ${menuItem.image.substring(0, 30)}... (${menuItem.image.length} chars)` : 'No image'
    });

    const updatedMenuItem = await menuItem.save();
    console.log('Menu item updated successfully:', updatedMenuItem._id);
    res.json(updatedMenuItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Error updating menu item', error: error.message });
  }
});

// @desc    Delete a menu item
// @route   DELETE /api/menu-items/:id
// @access  Private
const deleteMenuItem = asyncHandler(async (req, res) => {
  // Use req.user.id instead of req.hotel._id for consistency with the rest of the controller
  const hotelId = req.user?.id || req.hotel?._id;
  
  if (!hotelId) {
    return res.status(400).json({ message: 'Hotel ID not found in request' });
  }

  const menuItem = await MenuItem.findById(req.params.id);

  if (!menuItem) {
    return res.status(404).json({ message: 'Menu item not found' });
  }

  // Check if the menu item belongs to this hotel
  if (menuItem.hotel.toString() !== hotelId.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this menu item' });
  }

  try {
    // First, check for and delete any associated urgent sales
    console.log(`Checking for urgent sales associated with menu item ${req.params.id}`);
    const associatedSales = await UrgentSale.find({ product: req.params.id });
    
    if (associatedSales && associatedSales.length > 0) {
      console.log(`Found ${associatedSales.length} urgent sales associated with menu item ${req.params.id}`);
      
      // Delete each associated urgent sale
      for (const sale of associatedSales) {
        console.log(`Deleting urgent sale ${sale._id} associated with menu item ${req.params.id}`);
        await UrgentSale.findByIdAndDelete(sale._id);
      }
      
      console.log(`Successfully deleted ${associatedSales.length} urgent sales associated with menu item ${req.params.id}`);
    } else {
      console.log(`No urgent sales found associated with menu item ${req.params.id}`);
    }
    
    // Now delete the menu item
    await MenuItem.findByIdAndDelete(req.params.id);
    
    res.json({ 
      message: 'Menu item removed successfully',
      deletedUrgentSales: associatedSales ? associatedSales.length : 0
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Error deleting menu item', error: error.message });
  }
});

// @desc    Get menu items by category
// @route   GET /api/menu-items/category/:category
// @access  Private
const getMenuItemsByCategory = asyncHandler(async (req, res) => {
  const menuItems = await MenuItem.find({
    hotel: req.hotel._id,
    category: req.params.category,
  });
  res.json(menuItems);
});

// @desc    Get all menu categories for a hotel
// @route   GET /api/menu-items/categories
// @access  Private
const getMenuCategories = asyncHandler(async (req, res) => {
  console.log('Getting menu categories');
  
  // Use req.user.id instead of req.hotel._id for consistency
  const hotelId = req.user?.id || req.user?._id || req.hotel?._id;
  
  if (!hotelId) {
    console.warn('Hotel ID not found in request, returning default categories');
    return res.status(200).json([
      'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Special', 
      'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Soup', 
      'Salad', 'Pasta', 'Rice Dish', 'Seafood', 'Vegetarian', 
      'Vegan', 'Gluten-Free', 'Street Food', 'Pizza', 'Burger', 
      'Sandwich', 'Fast Food', 'Healthy Options', "Chef's Special"
    ]);
  }
  
  try {
    // Find all menu items for this hotel
    const menuItems = await MenuItem.find({ hotel: hotelId });
    
    // Extract unique categories
    const categories = [...new Set(menuItems.map(item => item.category))].filter(Boolean);
    console.log(`Found ${categories.length} categories from this hotel's menu items:`, categories);
    
    // Add default categories if the hotel doesn't have many categories yet
    const defaultCategories = [
      'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Special', 
      'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Soup', 
      'Salad', 'Pasta', 'Rice Dish', 'Seafood', 'Vegetarian', 
      'Vegan', 'Gluten-Free', 'Street Food', 'Pizza', 'Burger', 
      'Sandwich', 'Fast Food', 'Healthy Options', "Chef's Special"
    ];
    
    // Always combine existing and default categories
    const allCategories = [...new Set([...categories, ...defaultCategories])].sort();
    
    console.log(`Returning ${allCategories.length} menu categories`);
    return res.status(200).json(allCategories);
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    
    // Even if there's an error, return default categories
    console.log('Returning default categories due to error');
    return res.status(200).json([
      'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Special', 
      'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Soup', 
      'Salad', 'Pasta', 'Rice Dish', 'Seafood', 'Vegetarian', 
      'Vegan', 'Gluten-Free', 'Street Food', 'Pizza', 'Burger', 
      'Sandwich', 'Fast Food', 'Healthy Options', "Chef's Special"
    ]);
  }
});

// @desc    Get menu items by hotel ID for public access
// @route   GET /api/menu-items/hotel/:hotelId
// @access  Public
const getMenuItemsByHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  
  console.log(`Getting public menu items for hotel ID: ${hotelId}`);
  
  try {
    // Get menu items for the specified hotel, only return available items
    const menuItems = await MenuItem.find({ 
      hotel: hotelId,
      isAvailable: { $ne: false } // Include items where isAvailable is true or not set
    }).sort({ category: 1, name: 1 });
    
    console.log(`Found ${menuItems.length} menu items for hotel ${hotelId}`);
    
    // Return the menu items directly
    res.json(menuItems);
  } catch (error) {
    console.error(`Error fetching menu items for hotel ${hotelId}:`, error);
    res.status(500).json({ 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
});

export {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
  getMenuCategories,
  getMenuItemsByHotel
}; 