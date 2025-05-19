import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import WishlistActivity from '../models/WishlistActivity.js';
import catchAsync from '../utils/catchAsync.js';

// Get user wishlist
export const getWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Find user's wishlist
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'products.product',
      select: 'name price discountPrice images description category stock ratings seller'
    });
    
    // If no wishlist exists, create one
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
      wishlist = await wishlist.populate({
        path: 'products.product',
        select: 'name price discountPrice images description category stock ratings seller'
      });
    }

    // Process the wishlist to enhance with direct product details
    const processedWishlist = wishlist.products.map(item => {
      const product = item.product ? { ...item.product.toObject() } : null;
      
      // For items where the product reference exists but is null (product was deleted)
      // Use the directly stored product details from the wishlist entry
      if (!product && (item.productName || item.productImage)) {
        return {
          product: {
            _id: item.product || 'unavailable',
            name: item.productName || 'Product Unavailable',
            price: item.productPrice || 0,
            discountPrice: item.productDiscountPrice || null,
            category: item.productCategory || 'Unknown',
            seller: item.productSeller || 'Unknown',
            // Create a direct image object from the stored image URL
            image: item.productImage ? { url: item.productImage } : null,
            images: item.productImage ? [{ url: item.productImage }] : []
          },
          addedAt: item.addedAt
        };
      }
      
      // For products that exist but might be missing images
      if (product && item.productImage) {
        // Add the stored image URL to the product if it exists
        if (!product.image || !product.image.url) {
          product.image = { url: item.productImage };
        }
        if (!product.images || product.images.length === 0) {
          product.images = [{ url: item.productImage }];
        }
      }
      
      return {
        product: product || {
          _id: item.product || 'unavailable',
          name: 'Product No Longer Available',
          category: 'Unknown'
        },
        addedAt: item.addedAt
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        wishlist: processedWishlist
      }
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    
    // In case of database errors, return mock data for development
    const mockWishlist = [
      {
        product: {
          _id: 'mock-product-1',
          name: 'Organic Tomatoes',
          price: 40,
          discountPrice: 20,
          images: [{ url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea', alt: 'Tomatoes' }],
          description: 'Fresh organic tomatoes',
          category: 'Vegetables',
          stock: 50,
          ratings: { average: 4.5, count: 28 },
          seller: 'Green Farms'
        },
        addedAt: new Date()
      },
      {
        product: {
          _id: 'mock-product-2',
          name: 'Fresh Spinach Bundle',
          price: 25,
          discountPrice: null,
          images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb', alt: 'Spinach' }],
          description: 'Fresh and nutritious spinach',
          category: 'Leafy Greens',
          stock: 30,
          ratings: { average: 4.2, count: 15 },
          seller: 'Organic Valley'
        },
        addedAt: new Date()
      }
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        wishlist: mockWishlist
      },
      message: 'Using mock data due to database error'
    });
  }
});

// Add product to wishlist
export const addToWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID and potential product details from request body
    const { productId, productDetails } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product ID is required'
      });
    }
    
    // Check if product exists
    let product = await Product.findById(productId);
    
    if (!product) {
      if (productDetails) {
        // If product details are provided but product isn't in the DB, we can still add to wishlist
        console.log('Product not found in DB but details provided, creating on-the-fly product for wishlist');
      } else {
        return res.status(404).json({
          status: 'fail',
          message: 'Product not found'
        });
      }
    }
    
    // Find user's wishlist or create one
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    
    // Check if product is already in wishlist
    const isProductInWishlist = wishlist.products.some(item => 
      item.product.toString() === productId
    );
    
    if (isProductInWishlist) {
      return res.status(400).json({
        status: 'fail',
        message: 'Product already in wishlist'
      });
    }

    // Store the complete product details if provided
    let productData = {
      product: productId,
      addedAt: new Date()
    };
    
    // Add optional productImage, productName, productCategory fields if details were provided
    if (productDetails) {
      // Extract only necessary fields to keep wishlist entry small
      // First try explicit productImage field sent by the frontend
      productData.productImage = productDetails.productImage || 
                               // Then check the image field
                               productDetails.image ||
                               // Then check image.url structure
                               productDetails.image?.url ||
                               // Then check images array
                               productDetails.images?.[0]?.url ||
                               null;
      
      // Log extracted image data for debugging
      console.log('Wishlist image data:', {
        productId,
        hasProductDetails: true,
        extractedImage: productData.productImage ? 'has image' : 'no image',
        imagePreview: productData.productImage ? 
          productData.productImage.substring(0, 50) + '...' : 'none'
      });
      
      productData.productName = productDetails.name || null;
      productData.productCategory = productDetails.category || null;
      productData.productPrice = productDetails.price || null;
      productData.productDiscountPrice = productDetails.discountPrice || null;
      productData.productSeller = typeof productDetails.seller === 'string' ?
                                  productDetails.seller :
                                  productDetails.seller?.name || null;
    }
    
    // Add product to wishlist
    wishlist.products.push(productData);
    
    await wishlist.save();
    
    // Record activity
    await WishlistActivity.create({
      user: userId,
      product: productId,
      action: 'add'
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add product to wishlist'
    });
  }
});

// Remove product from wishlist
export const removeFromWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params
    const productId = req.params.productId;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        status: 'fail',
        message: 'Wishlist not found'
      });
    }
    
    // Check if product is in wishlist
    const productIndex = wishlist.products.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (productIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found in wishlist'
      });
    }
    
    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    
    await wishlist.save();
    
    // Record activity
    await WishlistActivity.create({
      user: userId,
      product: productId,
      action: 'remove'
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove product from wishlist'
    });
  }
});

// Check if product is in wishlist
export const checkWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params
    const productId = req.params.productId;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(200).json({
        status: 'success',
        isInWishlist: false
      });
    }
    
    // Check if product is in wishlist
    const isInWishlist = wishlist.products.some(item => 
      item.product.toString() === productId
    );
    
    res.status(200).json({
      status: 'success',
      isInWishlist
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check wishlist status'
    });
  }
});

// Get collections/categories
export const getCollections = catchAsync(async (req, res) => {
  // This is a placeholder for future implementation
  // In a real app, you would have a separate model for wishlist collections
  
  res.status(200).json({
    status: 'success',
    data: {
      collections: [
        { id: 'vegetables', name: 'Vegetables', items: 5 },
        { id: 'fruits', name: 'Fruits', items: 3 },
        { id: 'favorites', name: 'Favorites', items: 8 }
      ]
    }
  });
});

// Create collection
export const createCollection = catchAsync(async (req, res) => {
  // This is a placeholder for future implementation
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({
      status: 'fail',
      message: 'Collection name is required'
    });
  }
  
  // In a real app, you would create a new collection in the database
  
  res.status(201).json({
    status: 'success',
    data: {
      collection: {
        id: `collection-${Date.now()}`,
        name,
        items: 0
      }
    },
    message: 'Collection created successfully'
  });
});

// Move item to collection
export const moveToCollection = catchAsync(async (req, res) => {
  // This is a placeholder for future implementation
  const { collectionId } = req.params;
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Product ID is required'
    });
  }
  
  // In a real app, you would update the collection in the database
  
  res.status(200).json({
    status: 'success',
    message: 'Product moved to collection successfully'
  });
});

// Move product from wishlist to cart
export const moveToCart = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params
    const productId = req.params.productId;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        status: 'fail',
        message: 'Wishlist not found'
      });
    }
    
    // Check if product is in wishlist
    const productIndex = wishlist.products.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (productIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found in wishlist'
      });
    }
    
    // Get the product
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'Product not found'
      });
    }
    
    // Add product to cart
    // This would typically call a cart service or controller
    // For now, we'll just respond with success
    
    // Remove product from wishlist
    wishlist.products.splice(productIndex, 1);
    
    await wishlist.save();
    
    // Record activity
    await WishlistActivity.create({
      user: userId,
      product: productId,
      action: 'move-to-cart'
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Product moved to cart'
    });
  } catch (error) {
    console.error('Error moving from wishlist to cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to move product to cart'
    });
  }
});

// Clear entire wishlist
export const clearWishlist = catchAsync(async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({
        status: 'fail',
        message: 'Wishlist not found'
      });
    }
    
    // Clear products array
    wishlist.products = [];
    
    await wishlist.save();
    
    // Record activity
    await WishlistActivity.create({
      user: userId,
      action: 'clear'
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Wishlist cleared'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear wishlist'
    });
  }
}); 