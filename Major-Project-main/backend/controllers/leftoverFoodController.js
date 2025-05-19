import Inventory from '../models/Inventory.js';
import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';

// @desc    Create a new leftover food listing (using Inventory model)
// @route   POST /api/leftover-food
// @access  Private (Hotel Owners)
export const createListing = asyncHandler(async (req, res) => {
  console.log('Creating new leftover food listing');
  console.log('Request body:', req.body);
  console.log('User:', req.user);

  const {
    title,
    description,
    quantity,
    unit,
    expiryTime,
    price,
    category,
    dietaryInfo,
    images
  } = req.body;

  // Validate required fields
  if (!title) {
    console.log('Title is required');
    return res.status(400).json({ message: 'Title is required' });
  }

  if (!quantity) {
    console.log('Quantity is required');
    return res.status(400).json({ message: 'Quantity is required' });
  }

  // Map leftover food fields to Inventory fields
  try {
    console.log('Creating new inventory item with leftover food flag');
    
    const listing = await Inventory.create({
      hotel: req.user._id,
      name: title,
      description: description || '',
      quantity,
      unit,
      expiryDate: expiryTime,
      price,
      category: mapCategory(category), // Map to Inventory categories
      notes: `Dietary info: ${dietaryInfo?.join(', ') || 'None'}\nLeftover food listing\n${description || ''}`,
      isLeftoverFood: true, // Custom flag to identify leftover food listings
      isLowStock: false,
      location: 'Leftover Food',
      minStockLevel: 0,
      images: images || []
    });

    console.log('Created new leftover food listing:', listing._id);

    // Format the response
    const formattedListing = {
      _id: listing._id,
      title: listing.name,
      description: listing.description || '',
      quantity: listing.quantity,
      unit: listing.unit,
      expiryTime: listing.expiryDate,
      price: listing.price,
      status: 'available',
      category: reverseMapCategory(listing.category),
      dietaryInfo: extractDietaryInfo(listing.notes),
      images: listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80']
    };

    return res.status(201).json(formattedListing);
  } catch (error) {
    console.error('Error creating leftover food listing:', error);
    return res.status(500).json({ 
      message: 'Error creating leftover food listing',
      error: error.message
    });
  }
});

// @desc    Get all leftover food listings
// @route   GET /api/leftover-food
// @access  Public
export const getListings = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status || 'available';
  const categoryQuery = req.query.category || '';
  const search = req.query.search || '';

  const query = { 
    location: 'Leftover Food',
    isLeftoverFood: true
  };
  
  // Handle status filtering
  if (status === 'available') {
    query.isOutOfStock = false;
    query.isReserved = { $ne: true };
  } else if (status === 'reserved') {
    query.isOutOfStock = false;
    query.isReserved = true;
  } else if (status === 'sold') {
    query.isOutOfStock = true;
  }
  
  // Handle category filtering
  if (categoryQuery) {
    query.category = mapCategory(categoryQuery);
  }
  
  // Handle search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  const count = await Inventory.countDocuments(query);
  const listings = await Inventory.find(query)
    .populate('hotel', 'name email')
    .sort({ createdAt: -1 })
    .skip(pageSize * (page - 1))
    .limit(pageSize);

  // Map Inventory items to leftover food format
  const formattedListings = listings.map(item => {
    // Process images to ensure they have the correct URLs
    const processedImages = (item.images && item.images.length > 0) 
      ? item.images.map(img => {
          // Make sure image URLs are properly formatted
          if (img.startsWith('/')) {
            return `${req.protocol}://${req.get('host')}${img}`;
          } else if (!img.startsWith('http')) {
            return `${req.protocol}://${req.get('host')}/${img}`; 
          }
          return img;
        })
      : ['https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80'];
      
    // Determine correct status
    let status = 'available';
    if (item.isOutOfStock) {
      status = 'sold';
    } else if (item.isReserved) {
      status = 'reserved';
    } else if (new Date(item.expiryDate) < new Date()) {
      status = 'expired';
    }

    return {
      _id: item._id,
      title: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unit: item.unit,
      expiryTime: item.expiryDate,
      price: item.price,
      status: status,
      category: reverseMapCategory(item.category),
      dietaryInfo: extractDietaryInfo(item.notes),
      images: processedImages
    };
  });

  res.json({
    listings: formattedListings,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get hotel owner's leftover food listings
// @route   GET /api/leftover-food/my-listings
// @access  Private (Hotel Owners)
export const getMyListings = asyncHandler(async (req, res) => {
  console.log('Getting leftover food listings for hotel');
  
  // Check if user is authenticated
  if (!req.user || !req.user._id) {
    console.error('User not authenticated or user ID missing');
    return res.status(401).json({ 
      message: 'Not authenticated. Please log in.'
    });
  }
  
  console.log('Authenticated user ID:', req.user._id);
  
  // Get pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Get filter parameters
  const category = req.query.category || '';
  const search = req.query.search || '';
  const status = req.query.status || '';
  
  console.log('Pagination:', { page, limit, skip });
  console.log('Filters:', { category, search, status });
  
  // Build the query
  const query = { 
    hotel: req.user._id,
    isLeftoverFood: true
  };
  
  // Add status filter if provided
  if (status) {
    if (status === 'available') {
      query.isOutOfStock = false;
      query.isReserved = { $ne: true };
      // Also check that expiry date is in the future
      query.expiryDate = { $gt: new Date() };
    } else if (status === 'reserved') {
      query.isOutOfStock = false;
      query.isReserved = true;
    } else if (status === 'sold') {
      query.isOutOfStock = true;
    } else if (status === 'expired') {
      query.isOutOfStock = false;
      query.expiryDate = { $lt: new Date() };
    }
  }
  
  // Add category filter if provided
  if (category) {
    query.category = mapCategory(category);
  }
  
  // Add search filter if provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  console.log('Query:', JSON.stringify(query));
  
  try {
    // Count total documents for pagination
    const total = await Inventory.countDocuments(query);
    console.log(`Total documents matching query: ${total}`);
    
    // Find listings for this specific hotel with pagination
    const listings = await Inventory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  
    console.log(`Found ${listings.length} leftover food listings for hotel ${req.user._id} (total: ${total})`);
    
    // If no listings found, return empty array with pagination info
    if (listings.length === 0) {
      console.log('No listings found for this hotel');
      return res.status(200).json({
        items: [],
        total: 0,
        page,
        pages: Math.ceil(total / limit) || 1
      });
    }
  
    // Map Inventory items to leftover food format
    const formattedListings = listings.map(item => {
      // Process images to ensure they have the correct URLs
      const processedImages = (item.images && item.images.length > 0) 
        ? item.images.map(img => {
            // Make sure image URLs are properly formatted
            if (img.startsWith('/')) {
              return `${req.protocol}://${req.get('host')}${img}`;
            } else if (!img.startsWith('http')) {
              return `${req.protocol}://${req.get('host')}/${img}`; 
            }
            return img;
          })
        : ['https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80'];
        
      // Determine correct status
      let status = 'available';
      if (item.isOutOfStock) {
        status = 'sold';
      } else if (item.isReserved) {
        status = 'reserved';
      } else if (new Date(item.expiryDate) < new Date()) {
        status = 'expired';
      }

      return {
        _id: item._id,
        title: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unit: item.unit,
        expiryTime: item.expiryDate,
        price: item.price,
        status: status,
        category: reverseMapCategory(item.category),
        dietaryInfo: extractDietaryInfo(item.notes),
        images: processedImages
      };
    });
  
    // Calculate pagination info
    const pages = Math.ceil(total / limit) || 1;
    
    console.log('Successfully formatted listings, returning response');
    return res.status(200).json({
      items: formattedListings,
      total,
      page,
      pages
    });
  } catch (error) {
    console.error('Error in getMyListings:', error);
    return res.status(500).json({ 
      message: 'Error fetching leftover food listings',
      error: error.message
    });
  }
});

// @desc    Get single listing
// @route   GET /api/leftover-food/:id
// @access  Public
export const getListing = asyncHandler(async (req, res) => {
  const listing = await Inventory.findById(req.params.id);

  if (!listing || !listing.isLeftoverFood) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Determine correct status
  let status = 'available';
  if (listing.isOutOfStock) {
    status = 'sold';
  } else if (listing.isReserved) {
    status = 'reserved';
  } else if (new Date(listing.expiryDate) < new Date()) {
    status = 'expired';
  }

  // Format response
  const formattedListing = {
    _id: listing._id,
    title: listing.name,
    description: listing.description || '',
    quantity: listing.quantity,
    unit: listing.unit,
    expiryTime: listing.expiryDate,
    price: listing.price,
    status: status,
    category: reverseMapCategory(listing.category),
    dietaryInfo: extractDietaryInfo(listing.notes),
    images: listing.images && listing.images.length > 0
      ? listing.images
      : ['https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80']
  };

  res.json(formattedListing);
});

// @desc    Update listing
// @route   PUT /api/leftover-food/:id
// @access  Private (Hotel Owners)
export const updateListing = asyncHandler(async (req, res) => {
  console.log('Updating leftover food listing');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', req.user._id);
  console.log('Listing ID:', req.params.id);

  const listing = await Inventory.findById(req.params.id);

  if (!listing) {
    console.log('Listing not found');
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user owns the listing
  if (listing.hotel.toString() !== req.user._id.toString()) {
    console.log('Not authorized to update this listing');
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  const {
    title,
    description,
    quantity,
    unit,
    expiryTime,
    price,
    category,
    dietaryInfo,
    status,
    images
  } = req.body;

  console.log('Current listing data:', JSON.stringify(listing, null, 2));
  console.log('Processing update with images:', images);

  // Prepare update object with all fields
  const updateData = {
    name: title || listing.name,
    description: description || listing.description,
    quantity: quantity !== undefined ? quantity : listing.quantity,
    unit: unit || listing.unit,
    expiryDate: expiryTime || listing.expiryDate,
    price: price !== undefined ? parseFloat(price) : listing.price,
    category: category ? mapCategory(category) : listing.category,
    notes: `Dietary info: ${dietaryInfo?.join(', ') || 'None'}\nLeftover food listing\n${description || ''}`,
    isOutOfStock: status === 'sold',
    isLeftoverFood: true,
    location: 'Leftover Food',
    // Only update images if provided and it's an array
    ...(images && Array.isArray(images) && { images: images })
  };

  console.log('Update data being sent to database:', JSON.stringify(updateData, null, 2));

  try {
    const updatedListing = await Inventory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Updated listing in database:', JSON.stringify(updatedListing, null, 2));

    if (!updatedListing) {
      console.error('Update failed - no document returned');
      throw new Error('Update failed');
    }

    const response = {
      _id: updatedListing._id,
      title: updatedListing.name,
      description: updatedListing.description || '',
      quantity: updatedListing.quantity,
      unit: updatedListing.unit,
      expiryTime: updatedListing.expiryDate,
      price: updatedListing.price,
      status: updatedListing.isOutOfStock ? 'sold' : (new Date(updatedListing.expiryDate) < new Date() ? 'expired' : 'available'),
      category: reverseMapCategory(updatedListing.category),
      dietaryInfo: extractDietaryInfo(updatedListing.notes),
      images: updatedListing.images && updatedListing.images.length > 0 ? updatedListing.images : []
    };

    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error updating leftover food listing:', error);
    res.status(500).json({
      message: 'Error updating leftover food listing',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Delete listing
// @route   DELETE /api/leftover-food/:id
// @access  Private (Hotel Owners)
export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Inventory.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user owns the listing
  if (listing.hotel.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  await listing.deleteOne();
  res.json({ message: 'Listing removed' });
});

// @desc    Update listing status
// @route   PATCH /api/leftover-food/:id/status
// @access  Private (Hotel Owners)
export const updateListingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const listing = await Inventory.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user owns the listing
  if (listing.hotel.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  // Map leftover food status to Inventory fields
  if (status === 'available') {
    listing.isOutOfStock = false;
    listing.isReserved = false;
    // Set expiry date to 24 hours from now when making available
    listing.expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  } else if (status === 'reserved') {
    listing.isOutOfStock = false;
    listing.isReserved = true;
  } else if (status === 'sold') {
    listing.isOutOfStock = true;
    listing.isReserved = false;
  }
  
  // Only update the status-related fields
  const updatedListing = await Inventory.findByIdAndUpdate(
    req.params.id,
    {
      isOutOfStock: listing.isOutOfStock,
      isReserved: listing.isReserved,
      expiryDate: listing.expiryDate
    },
    { new: true }
  );

  // Return the status that was requested, not the calculated one
  // This ensures the frontend gets the status it asked for
  const responseStatus = status;

  res.json({
    _id: updatedListing._id,
    title: updatedListing.name,
    description: updatedListing.notes?.replace(/Dietary info:.*\n/, '').replace('Leftover food listing\n', '') || '',
    quantity: updatedListing.quantity,
    unit: updatedListing.unit,
    expiryTime: updatedListing.expiryDate,
    price: updatedListing.price,
    status: responseStatus, // Use the requested status instead of calculating it
    category: reverseMapCategory(updatedListing.category),
    dietaryInfo: extractDietaryInfo(updatedListing.notes),
    images: updatedListing.images && updatedListing.images.length > 0 
      ? updatedListing.images 
      : ['https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80']
  });
});

// @desc    Reserve a leftover food item (add to cart)
// @route   POST /api/leftover-food/:id/reserve
// @access  Private (Users)
export const reserveLeftoverFood = asyncHandler(async (req, res) => {
  console.log('Reserving leftover food item');
  const { id } = req.params;
  const userId = req.user._id;
  
  try {
    // Find the listing
    const listing = await Inventory.findById(id);
    
    if (!listing) {
      console.log(`Listing ${id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Food listing not found'
      });
    }
    
    // Check if the listing is available
    if (listing.quantity <= 0) {
      console.log(`Listing ${id} is out of stock`);
      return res.status(400).json({
        success: false,
        message: 'This food item is no longer available'
      });
    }
    
    // Check if the listing has expired
    const now = new Date();
    if (listing.expiryDate && new Date(listing.expiryDate) < now) {
      console.log(`Listing ${id} has expired`);
      return res.status(400).json({
        success: false,
        message: 'This food item has expired'
      });
    }
    
    // Update the listing status to 'reserved'
    listing.isReserved = true;
    
    // Fix unit validation issue - map 'serving' to 'portions' if needed
    if (listing.unit === 'serving') {
      listing.unit = 'portions';
    }
    
    await listing.save();
    
    // Find or create a cart for the user
    let cart = await mongoose.model('Cart').findOne({ user: userId });
    
    if (!cart) {
      console.log(`Creating new cart for user ${userId}`);
      cart = new (mongoose.model('Cart'))({
        user: userId,
        items: []
      });
    }
    
    // Check if the item is already in the cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product && item.product.toString() === id
    );
    
    if (existingItemIndex >= 0) {
      console.log(`Item ${id} already in cart, updating quantity`);
      cart.items[existingItemIndex].quantity += 1;
    } else {
      console.log(`Adding leftover food ${id} to cart`);
      // Add the item to the cart
      cart.items.push({
        product: id,
        quantity: 1,
        price: listing.price || 0,
        productName: listing.name,
        productImage: listing.images && listing.images.length > 0 
          ? listing.images[0] 
          : 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
        productCategory: 'Leftover Food',
        productSeller: listing.hotel,
        productStock: listing.quantity
      });
    }
    
    // Save the cart
    await cart.save();
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Item reserved successfully and added to your cart',
      status: 'reserved',
      cartItems: cart.totalItems
    });
    
  } catch (error) {
    console.error('Error reserving leftover food:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error reserving leftover food item'
    });
  }
});

// Helper function to map leftover food categories to Inventory categories
function mapCategory(leftoverCategory) {
  const categoryMap = {
    'meals': 'other',
    'snacks': 'other',
    'desserts': 'other',
    'beverages': 'beverages',
    'other': 'other'
  };
  
  return categoryMap[leftoverCategory] || 'other';
}

// Helper function to map Inventory categories back to leftover food categories
function reverseMapCategory(inventoryCategory) {
  if (inventoryCategory === 'beverages') return 'beverages';
  return 'meals'; // Default to meals for most items
}

// Helper function to extract dietary info from notes
function extractDietaryInfo(notes) {
  if (!notes) return [];
  
  const match = notes.match(/Dietary info: (.*)\n/);
  if (!match || !match[1]) return [];
  
  return match[1].split(', ').filter(item => item !== 'None');
} 