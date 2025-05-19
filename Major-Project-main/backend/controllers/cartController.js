import User from '../models/User.js';
import Product from '../models/Product.js';
import catchAsync from '../utils/catchAsync.js';
import mongoose from 'mongoose';
import Cart from '../models/Cart.js';
import UrgentSale from '../models/UrgentSale.js';

// Get user's cart
export const getCart = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    console.log(`Fetching cart for user ${userId}`);
    
    try {
      // Find cart - don't use populate initially to avoid potential reference errors
      const cart = await Cart.findOne({ user: userId });
      
      // If no cart exists, create an empty one
      if (!cart) {
        console.log(`No cart found for user ${userId}, creating empty cart`);
        const newCart = new Cart({
          user: userId,
          items: [],
          totalItems: 0,
          totalAmount: 0
        });
        
        await newCart.save();
        
        return res.status(200).json({
          status: 'success',
          data: {
            items: [],
            totalItems: 0,
            totalAmount: 0
          }
        });
      }
      
      console.log(`Cart found with ${cart.items.length} items, manually populating products`);
      
      // Manually populate products to handle both Product and UrgentSale collections
      const populatedItems = await Promise.all(cart.items.map(async (item) => {
        if (!item.product) {
          console.log(`Cart item found with null product reference, skipping`);
          return null;
        }
        
        try {
          // Try to find in regular Product collection first
          let product = await Product.findById(item.product).select('name price discountPrice images description category seller stock isOrganic isFeatured');
          
          // If not found in Product collection, check UrgentSale collection
          if (!product) {
            console.log(`Product ${item.product} not found in regular Products, checking UrgentSale collection...`);
            const urgentSaleProduct = await UrgentSale.findById(item.product);
            
            if (urgentSaleProduct) {
              console.log(`Found product in UrgentSale collection: ${urgentSaleProduct.name}`);
              
              // Create a compatible product object from UrgentSale
              product = {
                _id: urgentSaleProduct._id,
                name: urgentSaleProduct.name,
                price: urgentSaleProduct.price || urgentSaleProduct.originalPrice,
                discountPrice: urgentSaleProduct.discountedPrice,
                images: urgentSaleProduct.image ? [{ url: urgentSaleProduct.image }] : [],
                description: urgentSaleProduct.description,
                category: urgentSaleProduct.category,
                seller: urgentSaleProduct.seller,
                stock: urgentSaleProduct.quantity || urgentSaleProduct.stock,
                isOrganic: urgentSaleProduct.isOrganic || false,
                isFeatured: urgentSaleProduct.featured || false,
                isUrgent: true
              };
            } else {
              console.log(`Product ${item.product} not found in any collection`);
              // Return item without populated product - will be filtered out later
              return {
                ...item.toObject(),
                product: null
              };
            }
          }
          
          // Return item with populated product
          return {
            ...item.toObject(),
            product
          };
        } catch (err) {
          console.error(`Error finding product ${item.product}:`, err);
          // Continue with the item but with null product
          return {
            ...item.toObject(),
            product: null
          };
        }
      }));
      
      // Filter out items with null product
      const validItems = populatedItems.filter(item => item && item.product);
      
      if (validItems.length < cart.items.length) {
        console.log(`Removing ${cart.items.length - validItems.length} invalid cart items with null products`);
        
        // Update cart in database to remove invalid items
        cart.items = cart.items.filter(item => 
          item.product && validItems.some(validItem => 
            validItem.product && validItem.product._id.toString() === item.product.toString()
          )
        );
        
        // Recalculate cart totals
        cart.totalItems = cart.items.reduce((total, item) => {
          return total + (Number(item.quantity) || 0);
        }, 0);
        
        cart.totalAmount = cart.items.reduce((total, item) => {
          return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
        }, 0);
        
        // Round to 2 decimal places
        cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
        
        // Save the updated cart
        try {
          await cart.save();
          console.log(`Updated cart saved with ${cart.items.length} valid items`);
        } catch (saveErr) {
          console.error(`Error saving updated cart: ${saveErr.message}`);
        }
      }
      
      // Return the manually populated cart items
      return res.status(200).json({
        status: 'success',
        data: {
          items: validItems,
          totalItems: cart.totalItems || 0,
          totalAmount: cart.totalAmount || 0
        }
      });
    } catch (cartError) {
      console.error('Error processing cart data:', cartError);
      return res.status(500).json({
        status: 'error',
        message: 'Error processing cart data',
        error: cartError.message
      });
    }
  } catch (error) {
    console.error('Error getting cart:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve cart',
      error: error.message
    });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    console.log('============= START ADD TO CART =============');
    console.log('Request body:', req.body);
    
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Current state:', mongoose.connection.readyState);
      return res.status(500).json({
        status: 'error',
        message: 'Database connection is not available'
      });
    }
    
    const { productId, quantity = 1, product: productDetails } = req.body;
    console.log('Product ID:', productId);
    console.log('Quantity:', quantity);
    console.log('User ID:', req.user._id);
    console.log('Product Details provided:', productDetails ? 'Yes' : 'No');
    
    // Basic validation
    if (!productId) {
      console.log('Product ID is missing');
      return res.status(400).json({ 
        status: 'error',
        message: 'Product ID is required' 
      });
    }
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error(`Invalid MongoDB ObjectId format: ${productId}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format'
      });
    }
    
    // SPECIAL HANDLING FOR HOTEL ID 67d993b3fc12aa16718aa438
    // This is to fix issues with this specific hotel's menu items
    const specialHotelId = '67d993b3fc12aa16718aa438';
    const isSpecialHotel = productDetails && 
      (productDetails.restaurantId === specialHotelId || 
       productDetails.hotelId === specialHotelId || 
       productDetails.seller === specialHotelId ||
       (productDetails.restaurantId && productDetails.restaurantId.toString() === specialHotelId));
    
    // Also add special handling for restaurant ID 67ce83e6b49cd8fe9297a753
    const specialRestaurantId = '67ce83e6b49cd8fe9297a753';
    const isSpecialRestaurant = productDetails && 
      (productDetails.restaurantId === specialRestaurantId || 
       productDetails.restaurantId && productDetails.restaurantId.toString() === specialRestaurantId ||
       productDetails.seller === specialRestaurantId ||
       (productDetails.sellerId && productDetails.sellerId.toString() === specialRestaurantId));
    
    if (isSpecialHotel) {
      console.log(`SPECIAL HANDLING: Product from test hotel ID: ${specialHotelId}`);
      
      try {
        // For these special hotel items, we'll treat them directly instead of requiring DB lookup
        // Create a product-like object from the productDetails
        const mockProduct = {
          _id: productId,
          name: productDetails.name,
          price: productDetails.price,
          description: productDetails.description || '',
          category: productDetails.category || 'Menu Item',
          seller: specialHotelId, // Set seller explicitly
          sellerId: specialHotelId, // Set sellerId explicitly
          stock: 100, // Assume sufficient stock
          images: [{ url: productDetails.image }],
          image: productDetails.image,
          isRestaurantItem: true
        };
        
        console.log('Created mock product for special hotel:', mockProduct.name);
        
        // Find or create cart
        console.log('Looking for existing cart');
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
          console.log(`Creating new cart for user: ${req.user._id}`);
          cart = new Cart({
            user: req.user._id,
            items: []
          });
        } else {
          console.log(`Found existing cart with ${cart.items.length} items`);
        }
        
        // Check if product is already in cart
        const existingItemIndex = cart.items.findIndex(
          item => item.product && item.product.toString() === productId
        );
        
        if (existingItemIndex > -1) {
          // Update quantity if product exists
          console.log(`Updating existing item quantity from ${cart.items[existingItemIndex].quantity} to ${cart.items[existingItemIndex].quantity + quantity}`);
          cart.items[existingItemIndex].quantity += Number(quantity);
          cart.items[existingItemIndex].price = mockProduct.price;
          
          // Update additional product details
          cart.items[existingItemIndex].productName = mockProduct.name;
          cart.items[existingItemIndex].productImage = mockProduct.image;
          cart.items[existingItemIndex].productCategory = mockProduct.category;
          cart.items[existingItemIndex].productSeller = specialHotelId;
          cart.items[existingItemIndex].productSellerId = specialHotelId;
          cart.items[existingItemIndex].productStock = mockProduct.stock;
        } else {
          // Add new item to cart
          console.log('Adding new item to cart for special hotel');
          const newItem = {
            product: productId,
            quantity: Number(quantity),
            price: mockProduct.price,
            addedAt: new Date(),
            productName: mockProduct.name,
            productImage: mockProduct.image,
            productCategory: mockProduct.category,
            productSeller: specialHotelId,
            productSellerId: specialHotelId,
            productStock: mockProduct.stock
          };
          cart.items.push(newItem);
        }
        
        // Calculate cart totals
        console.log('Calculating cart totals');
        cart.totalItems = cart.items.reduce((total, item) => {
          return total + (Number(item.quantity) || 0);
        }, 0);
        
        cart.totalAmount = cart.items.reduce((total, item) => {
          return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
        }, 0);
        
        // Round to 2 decimal places
        cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
        
        console.log(`Cart totals calculated for special hotel: ${cart.totalItems} items, $${cart.totalAmount}`);
        
        // Save cart
        console.log('Saving cart for special hotel...');
        await cart.save();
        console.log('Cart saved successfully for special hotel');
        
        // Update dashboard stats
        try {
          await updateCartStats(req.user._id, cart.items.length);
          console.log('Dashboard stats updated');
        } catch (statsError) {
          console.error('Non-critical error updating cart stats:', statsError);
          // Continue without failing the request
        }
        
        console.log('============= END ADD TO CART FOR SPECIAL HOTEL =============');
        return res.status(200).json({
          status: 'success',
          data: {
            cart
          }
        });
      } catch (specialHotelError) {
        console.error('Error processing special hotel item:', specialHotelError);
        // Continue with normal flow as fallback
      }
    }
    
    // Special handling for the restaurant with issues
    if (isSpecialRestaurant) {
      console.log(`SPECIAL HANDLING: Product from restaurant ID: ${specialRestaurantId}`);
      
      try {
        // For these special restaurant items, we'll treat them directly
        // Create a product-like object from the productDetails
        const mockProduct = {
          _id: productId,
          name: productDetails.name,
          price: productDetails.price,
          description: productDetails.description || '',
          category: productDetails.category || 'Menu Item',
          seller: specialRestaurantId, // Set seller explicitly
          sellerId: specialRestaurantId, // Set sellerId explicitly
          stock: 100, // Assume sufficient stock
          images: [{ url: productDetails.image }],
          image: productDetails.image,
          isRestaurantItem: true
        };
        
        console.log('Created mock product for special restaurant:', mockProduct.name);
        
        // Find or create cart
        console.log('Looking for existing cart');
        let cart = await Cart.findOne({ user: req.user._id });
        
        if (!cart) {
          console.log(`Creating new cart for user: ${req.user._id}`);
          cart = new Cart({
            user: req.user._id,
            items: []
          });
        } else {
          console.log(`Found existing cart with ${cart.items.length} items`);
        }
        
        // Check if product is already in cart
        const existingItemIndex = cart.items.findIndex(
          item => item.product && item.product.toString() === productId
        );
        
        if (existingItemIndex > -1) {
          // Update quantity if product exists
          console.log(`Updating existing item quantity from ${cart.items[existingItemIndex].quantity} to ${cart.items[existingItemIndex].quantity + quantity}`);
          cart.items[existingItemIndex].quantity += Number(quantity);
          cart.items[existingItemIndex].price = mockProduct.price;
          
          // Update additional product details
          cart.items[existingItemIndex].productName = mockProduct.name;
          cart.items[existingItemIndex].productImage = mockProduct.image;
          cart.items[existingItemIndex].productCategory = mockProduct.category;
          cart.items[existingItemIndex].productSeller = specialRestaurantId;
          cart.items[existingItemIndex].productSellerId = specialRestaurantId;
          cart.items[existingItemIndex].productStock = mockProduct.stock;
        } else {
          // Add new item to cart
          console.log('Adding new item to cart for special restaurant');
          const newItem = {
            product: productId,
            quantity: Number(quantity),
            price: mockProduct.price,
            addedAt: new Date(),
            productName: mockProduct.name,
            productImage: mockProduct.image,
            productCategory: mockProduct.category,
            productSeller: specialRestaurantId,
            productSellerId: specialRestaurantId,
            productStock: mockProduct.stock
          };
          cart.items.push(newItem);
        }
        
        // Calculate cart totals
        console.log('Calculating cart totals');
        cart.totalItems = cart.items.reduce((total, item) => {
          return total + (Number(item.quantity) || 0);
        }, 0);
        
        cart.totalAmount = cart.items.reduce((total, item) => {
          return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
        }, 0);
        
        // Round to 2 decimal places
        cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
        
        console.log(`Cart totals calculated for special restaurant: ${cart.totalItems} items, $${cart.totalAmount}`);
        
        // Save cart
        console.log('Saving cart for special restaurant...');
        await cart.save();
        console.log('Cart saved successfully for special restaurant');
        
        // Update dashboard stats
        try {
          await updateCartStats(req.user._id, cart.items.length);
          console.log('Dashboard stats updated');
        } catch (statsError) {
          console.error('Non-critical error updating cart stats:', statsError);
          // Continue without failing the request
        }
        
        console.log('============= END ADD TO CART FOR SPECIAL RESTAURANT =============');
        return res.status(200).json({
          status: 'success',
          data: {
            cart
          }
        });
      } catch (specialRestaurantError) {
        console.error('Error processing special restaurant item:', specialRestaurantError);
        // Continue with normal flow as fallback
      }
    }
    
    console.log(`Finding product with ID: ${productId}`);
    try {
      // Try to find in regular products collection first
      let product = await Product.findById(productId);
      
      // If not found in Product collection, check UrgentSale collection
      if (!product) {
        console.log(`Product not found in regular Products, checking UrgentSale collection...`);
        product = await UrgentSale.findById(productId);
        
        if (product) {
          console.log(`Found product in UrgentSale collection: ${product.name}, ID: ${product._id}`);
          
          // Normalize UrgentSale fields to match Product model fields
          product = {
            ...product._doc, // Keep all original properties
            price: product.discountedPrice || product.price,
            discountPrice: product.discountedPrice,
            stock: product.quantity,
            images: product.image ? [{ url: product.image }] : [],
            isUrgent: true
          };
        }
      }
      
      // For restaurant menu items, also try MenuItem model (if available)
      if (!product && productDetails && (productDetails.restaurantId || productDetails.hotelId)) {
        try {
          // Only attempt this if we have the MenuItem model
          const MenuItem = mongoose.model('MenuItem');
          console.log('Checking MenuItem collection for restaurant menu item...');
          
          const menuItem = await MenuItem.findById(productId);
          if (menuItem) {
            console.log(`Found item in MenuItem collection: ${menuItem.name}`);
            
            // Normalize MenuItem fields to match Product model fields
            product = {
              _id: menuItem._id,
              name: menuItem.name,
              price: menuItem.price,
              description: menuItem.description,
              category: menuItem.category,
              seller: menuItem.hotel, // Use hotel field as seller
              stock: 100, // Assume sufficient stock for menu items
              images: menuItem.image ? [{ url: menuItem.image }] : [],
              image: menuItem.image,
              isRestaurantItem: true
            };
          }
        } catch (menuItemError) {
          if (menuItemError.name !== 'MissingSchemaError') {
            console.error('Error finding menu item:', menuItemError);
          }
          // Ignore errors from this attempt
        }
      }
      
      // FALLBACK for restaurant menu items if no product found
      if (!product && productDetails && (productDetails.restaurantId || productDetails.hotelId)) {
        console.log('Using product details as fallback for restaurant menu item');
        
        // Create a mock product from the provided details
        product = {
          _id: productId,
          name: productDetails.name,
          price: productDetails.price,
          description: productDetails.description || '',
          category: productDetails.category || 'Menu Item',
          seller: productDetails.restaurantId || productDetails.hotelId || productDetails.seller,
          sellerId: productDetails.sellerId,
          stock: 100, // Assume sufficient stock for menu items
          images: productDetails.image ? [{ url: productDetails.image }] : [],
          image: productDetails.image,
          isRestaurantItem: true
        };
        
        console.log('Created fallback product from details:', product.name);
      }
      
      // Check if product exists (in either collection)
      if (!product) {
        console.error(`Product not found with ID: ${productId} in any collection`);
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      console.log(`Product found: ${product.name}, ID: ${product._id}`);
      // Check if product is in stock (skip for restaurant menu items)
      if (!product.isRestaurantItem && product.stock < quantity) {
        console.log(`Insufficient stock. Requested: ${quantity}, Available: ${product.stock}`);
        return res.status(400).json({
          status: 'error',
          message: `Only ${product.stock} items available in stock`
        });
      }
      
      console.log(`Finding user with ID: ${req.user._id}`);
      const user = await User.findById(req.user._id);
      
      if (!user) {
        console.error(`User not found with ID: ${req.user._id}`);
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      console.log(`User found: ${user.name}, ID: ${user._id}`);
      
      // Find or create cart
      console.log('Looking for existing cart');
      let cart = await Cart.findOne({ user: req.user._id });
      
      if (!cart) {
        console.log(`Creating new cart for user: ${req.user._id}`);
        cart = new Cart({
          user: req.user._id,
          items: []
        });
      } else {
        console.log(`Found existing cart with ${cart.items.length} items`);
      }
      
      // Extract product image from details or product
      let productImage = null;
      let productSellerId = null; // Initialize seller ID variable
      
      if (productDetails) {
        console.log('Product details provided to extract image from:', {
          hasProductDetails: true,
          hasProductImage: !!productDetails.productImage,
          hasImage: !!productDetails.image,
          hasImages: !!(productDetails.images && productDetails.images.length > 0),
          hasSeller: !!(productDetails.seller || productDetails.sellerId),
          sample: productDetails.productImage ? 
            productDetails.productImage.substring(0, 30) + '...' : 
            (productDetails.image ? productDetails.image.substring(0, 30) + '...' : 'No image sample')
        });
        
        // Try multiple sources for the image
        if (productDetails.productImage) {
          productImage = productDetails.productImage;
          console.log('Using productImage field from details');
        } else if (productDetails.image) {
          productImage = productDetails.image;
          console.log('Using image field from details');
        } else if (productDetails.images && productDetails.images.length > 0) {
          if (productDetails.images[0].url) {
            productImage = productDetails.images[0].url;
            console.log('Using first image URL from images array');
          } else if (typeof productDetails.images[0] === 'string') {
            productImage = productDetails.images[0];
            console.log('Using first image string from images array');
          }
        }
        
        // Extract seller ID from product details
        if (productDetails.seller) {
          if (typeof productDetails.seller === 'object' && productDetails.seller._id) {
            productSellerId = productDetails.seller._id;
            console.log('Extracted seller ID from seller object:', productSellerId);
          } else if (typeof productDetails.seller === 'string') {
            productSellerId = productDetails.seller;
            console.log('Using seller ID string from details:', productSellerId);
          }
        } else if (productDetails.sellerId) {
          productSellerId = productDetails.sellerId;
          console.log('Using explicit sellerId from details:', productSellerId);
        } else if (productDetails.restaurantId) {
          productSellerId = productDetails.restaurantId;
          console.log('Using restaurantId as sellerId:', productSellerId);
        } else if (productDetails.hotelId) {
          productSellerId = productDetails.hotelId;
          console.log('Using hotelId as sellerId:', productSellerId);
        }
      }
      
      // If no image from details, try from product
      if (!productImage) {
        if (product.images && product.images.length > 0 && product.images[0].url) {
          productImage = product.images[0].url;
          console.log('Using image from product.images array');
        } else if (product.image && product.image.url) {
          productImage = product.image.url;
          console.log('Using image from product.image.url');
        } else if (typeof product.image === 'string') {
          productImage = product.image;
          console.log('Using image from product.image string');
        }
      }
      
      // If no seller ID from details, get from product
      if (!productSellerId && product.seller) {
        productSellerId = typeof product.seller === 'object' ? product.seller._id : product.seller;
        console.log('Extracted seller ID from product:', productSellerId);
      }
      
      console.log('Final product image extracted:', productImage ? 'Image found' : 'No image');
      if (productImage) {
        console.log('Image preview:', productImage.substring(0, 50) + '...');
      }
      
      console.log('Final seller ID extracted:', productSellerId || 'No seller ID found');
      
      // Check if product is already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.product && item.product.toString() === productId
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if product exists
        console.log(`Updating existing item quantity from ${cart.items[existingItemIndex].quantity} to ${cart.items[existingItemIndex].quantity + quantity}`);
        cart.items[existingItemIndex].quantity += Number(quantity);
        cart.items[existingItemIndex].price = product.price; // Update price in case it changed
        
        // Update additional product details in case they changed
        cart.items[existingItemIndex].productName = product.name;
        cart.items[existingItemIndex].productImage = productImage;
        cart.items[existingItemIndex].productCategory = product.category;
        cart.items[existingItemIndex].productDiscountPrice = product.discountPrice;
        cart.items[existingItemIndex].productSeller = typeof product.seller === 'string' ? 
          product.seller : product.seller?.name || null;
        cart.items[existingItemIndex].productSellerId = productSellerId;
        cart.items[existingItemIndex].productStock = product.stock;
        
        console.log(`Updated cart item ${existingItemIndex} with productImage:`, 
          cart.items[existingItemIndex].productImage ? 'Image set' : 'No image');
      } else {
        // Add new item to cart
        console.log('Adding new item to cart');
        const newItem = {
          product: product._id,
          quantity: Number(quantity),
          price: product.price,
          addedAt: new Date(),
          productName: product.name,
          productImage: productImage,
          productCategory: product.category,
          productDiscountPrice: product.discountPrice,
          productSeller: typeof product.seller === 'string' ? 
            product.seller : product.seller?.name || null,
          productSellerId: productSellerId,
          productStock: product.stock
        };
        console.log('New cart item details:', {
          productId: newItem.product,
          quantity: newItem.quantity,
          price: newItem.price,
          hasSellerId: !!productSellerId
        });
        cart.items.push(newItem);
      }
      
      // Calculate cart totals directly
      console.log('Calculating cart totals');
      cart.totalItems = cart.items.reduce((total, item) => {
        return total + (Number(item.quantity) || 0);
      }, 0);
      
      cart.totalAmount = cart.items.reduce((total, item) => {
        return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
      }, 0);
      
      // Round to 2 decimal places
      cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
      
      console.log(`Cart totals calculated: ${cart.totalItems} items, $${cart.totalAmount}`);
      
      // Save cart
      console.log('Saving cart...');
      try {
        await cart.save();
        console.log('Cart saved successfully');
      } catch (saveError) {
        console.error('Error saving cart:', saveError);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to save cart',
          error: saveError.message
        });
      }
      
      // Update dashboard stats
      try {
        await updateCartStats(req.user._id, cart.items.length);
        console.log('Dashboard stats updated');
      } catch (statsError) {
        console.error('Non-critical error updating cart stats:', statsError);
        // Continue without failing the request
      }
      
      console.log('============= END ADD TO CART =============');
      return res.status(200).json({
        status: 'success',
        data: {
          cart
        }
      });
    } catch (dbError) {
      console.error('Database error when finding product:', dbError);
      return res.status(500).json({
        status: 'error',
        message: 'Database error when finding product',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    console.log('============= END ADD TO CART WITH ERROR =============');
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
};

// Helper function to update cart totals
function updateCartTotals(user) {
  try {
    if (!user || !user.cart) {
      console.warn('Cannot update cart totals: user or user.cart is undefined');
      return;
    }

    // Ensure items is an array
    const items = Array.isArray(user.cart.items) ? user.cart.items : [];
    
    // Calculate total items
    user.cart.totalItems = items.reduce((total, item) => {
      const quantity = parseInt(item.quantity, 10) || 0;
      return total + quantity;
    }, 0);
    
    // Calculate total amount
    user.cart.totalAmount = items.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity, 10) || 0;
      return total + (price * quantity);
    }, 0);
    
    // Round to 2 decimal places to avoid floating point precision issues
    user.cart.totalAmount = Math.round(user.cart.totalAmount * 100) / 100;
    
    console.log(`Updated cart totals: ${user.cart.totalItems} items, $${user.cart.totalAmount}`);
  } catch (error) {
    console.error('Error updating cart totals:', error);
    // Set default values if calculation fails
    user.cart.totalItems = 0;
    user.cart.totalAmount = 0;
  }
}

// Helper function to update dashboard stats
async function updateCartStats(userId, cartCount) {
  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid user ID for cart stats update:', userId);
      return;
    }
    
    // Use findOneAndUpdate to create the document if it doesn't exist
    await mongoose.connection.db.collection('dashboardStats').findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(userId) },
      { 
        $set: { 
          cartCount,
          lastUpdated: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log(`Updated dashboard stats for user ${userId} with cart count: ${cartCount}`);
  } catch (error) {
    console.error('Error updating cart stats:', error);
    // This is a non-critical operation, so we just log the error and continue
  }
}

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params
    const productId = req.params.productId;
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error(`Invalid MongoDB ObjectId format: ${productId}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format'
      });
    }
    
    console.log(`Removing product ${productId} from cart for user ${userId}`);
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }
    
    // Check if product is in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product && item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found in cart'
      });
    }
    
    // Remove product from cart
    cart.items.splice(itemIndex, 1);
    
    // Recalculate cart totals
    cart.totalItems = cart.items.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);
    
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
    
    // Round to 2 decimal places
    cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
    
    // Save updated cart
    await cart.save();
    
    // Update dashboard stats
    try {
      await updateCartStats(userId, cart.items.length);
    } catch (statsError) {
      console.error('Non-critical error updating cart stats:', statsError);
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Product removed from cart',
      data: {
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove product from cart'
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    // Get product ID from params and quantity from body
    const productId = req.params.productId;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be a positive number'
      });
    }
    
    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error(`Invalid MongoDB ObjectId format: ${productId}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product ID format'
      });
    }
    
    console.log(`Updating product ${productId} quantity to ${quantity} for user ${userId}`);
    
    // Find cart
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found'
      });
    }
    
    // Check if product is in cart
    const itemIndex = cart.items.findIndex(item => 
      item.product && item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found in cart'
      });
    }
    
    // Check stock availability in both Product and UrgentSale collections
    let product = null;
    
    // Try to find in regular Product collection first
    product = await Product.findById(productId);
    
    // If not found in Product collection, check UrgentSale collection
    if (!product) {
      console.log(`Product ${productId} not found in regular Products, checking UrgentSale collection...`);
      const urgentSaleProduct = await UrgentSale.findById(productId);
      
      if (urgentSaleProduct) {
        console.log(`Found product in UrgentSale collection: ${urgentSaleProduct.name}`);
        
        // Create a compatible product object from UrgentSale
        product = {
          _id: urgentSaleProduct._id,
          name: urgentSaleProduct.name,
          price: urgentSaleProduct.price || urgentSaleProduct.originalPrice,
          stock: urgentSaleProduct.quantity,
          isUrgent: true
        };
      }
    }
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    // Check if quantity is available
    if (quantity > product.stock) {
      return res.status(400).json({
        status: 'error',
        message: `Only ${product.stock} items available in stock`
      });
    }
    
    // Update quantity
    cart.items[itemIndex].quantity = Number(quantity);
    
    // Update product details in case they've changed
    cart.items[itemIndex].productStock = product.stock;
    
    // Recalculate cart totals
    cart.totalItems = cart.items.reduce((total, item) => {
      return total + (Number(item.quantity) || 0);
    }, 0);
    
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
    }, 0);
    
    // Round to 2 decimal places
    cart.totalAmount = Math.round(cart.totalAmount * 100) / 100;
    
    // Save updated cart
    await cart.save();
    
    // Update dashboard stats
    try {
      await updateCartStats(userId, cart.items.length);
    } catch (statsError) {
      console.error('Non-critical error updating cart stats:', statsError);
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Cart item updated',
      data: {
        items: cart.items,
        totalItems: cart.totalItems,
        totalAmount: cart.totalAmount
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item',
      error: error.message
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    
    console.log(`Clearing cart for user ${userId}`);
    
    // Find and update or create cart
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { 
        items: [],
        totalItems: 0,
        totalAmount: 0
      },
      { new: true, upsert: true }
    );
    
    console.log('Cart cleared successfully');
    
    // Update dashboard stats
    try {
      await updateCartStats(userId, 0);
    } catch (statsError) {
      console.error('Non-critical error updating cart stats:', statsError);
    }
    
    return res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: {
        items: [],
        totalItems: 0,
        totalAmount: 0
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart'
    });
  }
};

// Apply coupon code
export const applyCoupon = async (req, res) => {
  try {
    // Implementation for coupon functionality
    // This would validate the coupon and return discount information
    const { couponCode } = req.body;
    
    // Mock coupon validation - in a real app, you would look up the coupon in a database
    if (couponCode === 'FRESH10') {
      return res.status(200).json({
        status: 'success',
        data: {
          discount: 10,
          message: 'Coupon applied successfully'
        }
      });
    } else if (couponCode === 'WELCOME20') {
      return res.status(200).json({
        status: 'success',
        data: {
          discount: 20,
          message: 'Coupon applied successfully'
        }
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid coupon code'
      });
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to apply coupon'
    });
  }
};

// Calculate shipping
export const calculateShipping = async (req, res) => {
  try {
    // Implementation for shipping calculation
    // This would calculate shipping based on address, cart weight, etc.
    const { zipCode } = req.body;
    
    // Mock shipping calculation - in a real app, this would use shipping APIs
    const shippingCost = 5.99;
    const freeShippingThreshold = 50;
    
    return res.status(200).json({
      status: 'success',
      data: {
        shippingCost,
        freeShippingThreshold
      }
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to calculate shipping'
    });
  }
};

// Get lightweight version of cart data (optimized for payment)
export const getLightweightCartData = async (req, res) => {
  try {
    // Get user from middleware
    const userId = req.user._id;
    console.log(`Fetching lightweight cart data for user ${userId}`);
    
    // Find cart and populate necessary product details
    const cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name price discountPrice images seller stock'
    });
    
    // If no cart exists or it's empty
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'Cart is empty',
        data: {
          items: [],
          totals: {
            subtotal: 0,
            discountAmount: 0,
            shipping: 0,
            total: 0
          }
        }
      });
    }
    
    console.log(`Creating lightweight cart with ${cart.items.length} items`);
    
    // Extract seller ID from the first product for the entire order
    let sellerId = null;
    if (cart.items.length > 0) {
      const firstItem = cart.items[0];
      
      // Try to get seller ID from various sources
      if (firstItem.productSellerId) {
        sellerId = firstItem.productSellerId;
        console.log(`Using productSellerId from first cart item: ${sellerId}`);
      } else if (firstItem.product && firstItem.product.seller) {
        sellerId = firstItem.product.seller;
        console.log(`Using seller from populated product: ${sellerId}`);
      }
    }
    
    // Prepare items with essential information
    const items = await Promise.all(cart.items.map(async (item) => {
      // Log the item we're processing
      console.log(`Processing cart item for product: ${item.product}`);
      console.log(`Item has productSellerId: ${item.productSellerId || 'none'}`);
      
      // Ensure we have a valid product object
      let product = item.product || {};
      let itemSellerId = item.productSellerId || null;
      
      // If the product is not populated (Reference only), try to find it
      if (!product.name && item.product) {
        try {
          // First try regular Product collection
          product = await Product.findById(item.product).select('name price discountPrice images seller stock');
          
          if (product && product.seller) {
            itemSellerId = product.seller;
            console.log(`Found seller ID ${itemSellerId} in regular product`);
          }
          
          // If not found in Product collection, check UrgentSale collection
          if (!product) {
            console.log(`Product ${item.product} not found in regular Products, checking UrgentSale collection...`);
            const urgentProduct = await UrgentSale.findById(item.product);
            
            if (urgentProduct) {
              console.log(`Found product ${item.product} in UrgentSale collection`);
              
              // Store seller ID from urgent product
              if (urgentProduct.seller) {
                itemSellerId = urgentProduct.seller;
                console.log(`Found seller ID ${itemSellerId} in urgent sale product`);
              }
              
              // Normalize UrgentSale fields to match Product model fields
              product = {
                _id: urgentProduct._id,
                name: urgentProduct.name,
                price: urgentProduct.price || urgentProduct.originalPrice,
                discountPrice: urgentProduct.discountedPrice,
                stock: urgentProduct.quantity,
                image: urgentProduct.image,
                seller: urgentProduct.seller,
                isUrgent: true
              };
            }
          }
        } catch (err) {
          console.error(`Error finding product ${item.product}:`, err);
          // Continue with the data we have in the cart item
        }
      } else if (product.seller) {
        // If we have a populated product with seller information
        itemSellerId = product.seller;
        console.log(`Using seller ID ${itemSellerId} from populated product`);
      }
      
      // If this is our first item and global sellerId is not set yet, use this item's seller
      if (!sellerId && itemSellerId) {
        sellerId = itemSellerId;
        console.log(`Setting order's sellerId to ${sellerId} from item`);
      }
      
      // Use the cached field values from the cart item as fallback
      return {
        id: item.product?._id || item.product,
        product: {
          _id: product._id || item.product,
          name: product.name || item.productName || 'Unknown Product',
          price: product.price || item.price || 0,
          discountPrice: product.discountPrice || item.productDiscountPrice || null,
          image: product.image || item.productImage || null,
          seller: itemSellerId || sellerId || null,
          isUrgent: product.isUrgent || false
        },
        quantity: item.quantity,
        price: product.price || item.price || 0,
        name: product.name || item.productName || 'Unknown Product',
        image: product.images?.[0]?.url || product.image || item.productImage || null,
        productSellerId: itemSellerId || sellerId || null // Add sellerId to each item
      };
    }));
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    // Use standard shipping cost of 50 unless overridden
    const shipping = subtotal >= 500 ? 0 : 50; // Free shipping above 500
    
    const paymentData = {
      items,
      sellerId, // Add the seller ID for the entire order
      totals: {
        subtotal,
        discountAmount: 0, // No coupon applied in this lightweight version
        shipping,
        total: subtotal + shipping
      },
      couponDiscount: 0,
      shippingCost: shipping
    };
    
    console.log('Lightweight cart data prepared with sellerId:', sellerId || 'None found');
    
    return res.status(200).json({
      status: 'success',
      message: 'Lightweight cart data retrieved successfully',
      data: paymentData
    });
  } catch (error) {
    console.error('Error getting lightweight cart data:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error getting lightweight cart data',
      error: error.message
    });
  }
}; 