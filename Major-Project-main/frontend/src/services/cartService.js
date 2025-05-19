import api from './api';

// Get cart items
export const getCartItems = async () => {
  try {
    console.log('Fetching cart items...');
    // Only use the main API endpoint (to match where we're adding items)
    try {
      const response = await api.get('/api/cart');
      console.log('Cart items response (api endpoint):', response.data);
      
      // Check for empty response data structure
      if (!response.data) {
        console.error('Empty response data received from cart API');
        return {
          status: 'success',
          data: {
            items: [],
            totalItems: 0,
            totalAmount: 0
          }
        };
      }
      
      // Handle different data structures
      let items = [];
      if (response.data.data && response.data.data.items) {
        items = response.data.data.items;
        console.log('Items found in response.data.data.items:', items.length);
      } else if (response.data.items) {
        items = response.data.items;
        console.log('Items found in response.data.items:', items.length);
      }
      
      // If we found items, clean them up
      if (items && items.length > 0) {
        const validItems = items.filter(item => item && (item.product || item.productName));
        
        if (validItems.length < items.length) {
          console.warn(`Filtered out ${items.length - validItems.length} invalid cart items with null products`);
          items = validItems;
        }
        
        // Log first item for debugging
        if (validItems.length > 0) {
          console.log('First cart item:', {
            id: validItems[0].product?.toString?.() || validItems[0].product,
            name: validItems[0].productName || 'Unknown',
            price: validItems[0].price,
            qty: validItems[0].quantity
          });
        }
      } else {
        console.warn('No items found in cart response');
      }
      
      // Ensure we always return a consistent structure
      const result = {
        status: 'success',
        data: {
          items: items || [],
          totalItems: response.data.data?.totalItems || response.data.totalItems || 0,
          totalAmount: response.data.data?.totalAmount || response.data.totalAmount || 0
        }
      };
      
      console.log('Final cart data structure:', {
        itemCount: result.data.items.length,
        totalItems: result.data.totalItems,
        totalAmount: result.data.totalAmount
      });
      
      return result;
    } catch (error) {
      // Handle server error (500)
      if (error.response && error.response.status === 500) {
        console.error('Server error when fetching cart:', error.response.data);
        
        // Try to get detailed error message
        const errorMessage = error.response.data && error.response.data.message 
          ? error.response.data.message
          : 'Server error when fetching cart';
        
        console.log(`Error fetching cart: ${errorMessage}`);
        
        // Return a valid response structure with empty cart
        return {
          status: 'success',
          message: 'Using empty cart due to server error',
          data: {
            items: [],
            totalItems: 0,
            totalAmount: 0
          }
        };
      }
      
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (cartItem, quantity = 1) => {
  try {
    // Handle case where only productId is passed as string (from UrgentSales page)
    if (typeof cartItem === 'string') {
      const productId = cartItem;
      console.log('Adding item to cart by ID:', productId, 'quantity:', quantity);
      
      try {
        // First try to fetch the product details to get more information
        // This ensures we send all required fields to the backend
        const productResponse = await api.get(`/api/urgent-sales/${productId}`);
        if (productResponse.data && productResponse.data.data) {
          const product = productResponse.data.data;
          console.log('Found urgent sale product details:', product.name);
          
          // Create a properly formatted payload with all required fields
          const payload = {
            productId: productId,
            name: product.name,
            price: product.discountedPrice || product.price,
            quantity: quantity,
            image: product.image,
            seller: { _id: product.seller },
            restaurantId: product.seller
          };
          
          // Use direct insert endpoint
          const response = await api.post('/api/cart/direct-insert', payload);
          console.log('Cart API response (addToCart with product details):', response.data);
          
          if (!response.data) {
            throw new Error('Empty response from cart API');
          }
          
          return {
            status: 'success',
            message: response.data.message || 'Item added to cart',
            data: response.data.data || response.data
          };
        }
      } catch (fetchError) {
        console.log('Could not fetch product details, falling back to simple ID-based add:', fetchError.message);
      }
      
      // Fallback to simple ID-based payload if product fetch fails
      const payload = {
        productId: productId,
        quantity: quantity,
      };
      
      // Use direct insert endpoint
      const response = await api.post('/api/cart/direct-insert', payload);
      
      console.log('Cart API response (addToCart by ID):', response.data);
      
      if (!response.data) {
        throw new Error('Empty response from cart API');
      }
      
      return {
        status: 'success',
        message: response.data.message || 'Item added to cart',
        data: response.data.data || response.data
      };
    }
    
    // Original implementation for object-based cart items
    console.log('Adding item to cart (service):', cartItem);
    
    // Make sure we have all required fields
    if (!cartItem.productId || !cartItem.name || !cartItem.price) {
      throw new Error('Missing required cart item fields');
    }
    
    // Ensure we have a valid restaurant ID
    const restaurantId = cartItem.restaurantId || cartItem.seller?._id || 'default-restaurant';
    
    // Prepare the payload
    const payload = {
      productId: cartItem.productId,
      name: cartItem.name,
      price: cartItem.price,
      restaurantId: restaurantId,
      quantity: cartItem.quantity || 1,
      image: cartItem.image || ''
    };
    
    // Use direct insert endpoint for more consistent behavior
    const response = await api.post('/api/cart/direct-insert', payload);
    
    console.log('Cart API response (addToCart):', response.data);
    
    // Ensure we have a consistent response structure
    if (!response.data) {
      throw new Error('Empty response from cart API');
    }
    
    return {
      status: 'success',
      message: response.data.message || 'Item added to cart',
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error in addToCart service:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  try {
    console.log(`Updating cart item ${productId} to quantity ${quantity}`);
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    const response = await api.put(`/api/cart/${productId}`, { quantity });
    
    console.log('Update cart response:', response.data);
    
    return {
      status: 'success',
      message: 'Cart updated successfully',
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (productId) => {
  try {
    console.log(`Removing product ${productId} from cart`);
    
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    const response = await api.delete(`/api/cart/${productId}`);
    
    console.log('Remove from cart response:', response.data);
    
    return {
      status: 'success',
      message: 'Item removed from cart',
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    console.log('Clearing cart');
    const response = await api.delete('/api/cart');
    console.log('Clear cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Apply coupon code
export const applyCoupon = async (couponCode) => {
  try {
    console.log('Applying coupon:', couponCode);
    const response = await api.post('/api/cart/coupon', { couponCode });
    console.log('Apply coupon response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error applying coupon:', error);
    throw error;
  }
};

// Calculate shipping cost
export const calculateShipping = async (zipCode) => {
  try {
    console.log('Calculating shipping for zip code:', zipCode);
    const response = await api.post('/api/cart/shipping', { zipCode });
    console.log('Calculate shipping response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calculating shipping:', error);
    throw error;
  }
};

// Save payment data to user session
export const savePaymentData = async (paymentData) => {
  try {
    console.log('Saving payment data:', paymentData);
    
    // Check data size
    const dataSize = JSON.stringify(paymentData).length;
    console.log('Payment data size:', dataSize, 'bytes');
    
    // If data is too large, reduce it by keeping only essential information
    if (dataSize > 100000) { // Over 100KB, let's optimize
      console.log('Payment data is large, reducing size...');
      const reducedPaymentData = {
        items: paymentData.items.map(item => ({
          product: {
            _id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            discountPrice: item.product.discountPrice
          },
          quantity: item.quantity
        })),
        totals: paymentData.totals,
        couponDiscount: paymentData.couponDiscount,
        shippingCost: paymentData.shippingCost
      };
      paymentData = reducedPaymentData;
      console.log('Reduced payment data size to', JSON.stringify(reducedPaymentData).length, 'bytes');
    }
    
    // Always save to localStorage first as a reliable backup
    try {
      localStorage.setItem('paymentData', JSON.stringify(paymentData));
      console.log('Payment data saved to localStorage successfully');
    } catch (localStorageError) {
      console.error('Error saving to localStorage:', localStorageError);
      // Continue anyway to try API saving
    }
    
    // Now try to save to the API if the user is logged in
    try {
      console.log('Attempting to save payment data to database');
      const token = localStorage.getItem('token');
      
      // Only try API if user is logged in
      if (!token) {
        console.log('User not logged in, using localStorage only');
        return { status: 'success', message: 'Payment data saved to localStorage only (user not logged in)' };
      }
      
      const response = await api.post('/user/session/payment-data', { paymentData });
      console.log('Save payment data response (user endpoint):', response.data);
      return response.data;
    } catch (apiError) {
      console.error('Error saving to API, using localStorage only:', apiError);
      
      // Log detailed error information for diagnosis
      if (apiError.response) {
        console.log('API error response details:', {
          status: apiError.response.status,
          statusText: apiError.response.statusText,
          data: apiError.response.data,
          headers: apiError.response.headers
        });
        
        // Handle 400 Bad Request errors gracefully
        if (apiError.response.status === 400) {
          console.log('Received 400 Bad Request. Falling back to localStorage only.');
          return { 
            status: 'success', 
            message: 'Payment data saved to localStorage only (API returned 400)',
            usingLocalStorage: true 
          };
        }
      }
      
      // Return success anyway since we already saved to localStorage
      return { 
        status: 'success', 
        message: 'Payment data saved to localStorage only (API error)', 
        usingLocalStorage: true 
      };
    }
  } catch (error) {
    console.error('Error in savePaymentData:', error);
    if (error.response) {
      console.error('Error response details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    // Return a meaningful error instead of throwing
    return { 
      status: 'success',  // Change to success even on error since we have localStorage
      message: 'Failed to save payment data to API, but saved to localStorage: ' + (error.message || 'Unknown error'),
      usingLocalStorage: true
    };
  }
};

// Get payment data from user session
export const getPaymentData = async () => {
  try {
    console.log('Fetching payment data');
    
    // Check localStorage first for the fastest response
    let localStorageData = null;
    try {
      const paymentDataString = localStorage.getItem('paymentData');
      if (paymentDataString) {
        localStorageData = JSON.parse(paymentDataString);
        console.log('Found payment data in localStorage');
      }
    } catch (localStorageError) {
      console.error('Error reading from localStorage:', localStorageError);
      // Continue to try API
    }
    
    // Try the API only if the user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('User not logged in, using localStorage data only');
      if (localStorageData) {
        return { 
          status: 'success', 
          data: { 
            paymentData: localStorageData,
            updatedAt: new Date(),
            source: 'localStorage'
          } 
        };
      } else {
        return { status: 'error', message: 'No payment data found' };
      }
    }
    
    // Try API if user is logged in
    try {
      console.log('Attempting to fetch payment data from API');
      const response = await api.get('/user/session/payment-data');
      console.log('Get payment data response (API):', response.data);
      return response.data;
    } catch (apiError) {
      console.error('Error fetching from API, using localStorage data:', apiError);
      
      // Log detailed error information
      if (apiError.response) {
        console.log('API error response details:', {
          status: apiError.response.status,
          statusText: apiError.response.statusText,
          data: apiError.response.data,
          headers: apiError.response.headers
        });
        
        // Handle specific status codes
        if (apiError.response.status === 400) {
          console.log('Received 400 Bad Request error. Falling back to localStorage data.');
        } else if (apiError.response.status === 401) {
          console.log('Authentication error. User may need to log in again.');
        } else if (apiError.response.status === 404) {
          console.log('Payment data endpoint not found. Backend may not support this feature.');
        }
      } else if (apiError.request) {
        // Network error or CORS issue
        console.log('Network error occurred. No response received.');
      } else {
        console.log('Error setting up request:', apiError.message);
      }
      
      // Return localStorage data if available
      if (localStorageData) {
        return { 
          status: 'success', 
          data: { 
            paymentData: localStorageData,
            updatedAt: new Date(),
            source: 'localStorage'
          } 
        };
      } else {
        return { status: 'error', message: 'No payment data found in API or localStorage' };
      }
    }
  } catch (error) {
    console.error('Error in getPaymentData:', error);
    
    // Try to return localStorage data even on unexpected errors
    try {
      const paymentDataString = localStorage.getItem('paymentData');
      if (paymentDataString) {
        const localData = JSON.parse(paymentDataString);
        return { 
          status: 'success', 
          data: { 
            paymentData: localData,
            updatedAt: new Date(),
            source: 'localStorage (error fallback)'
          } 
        };
      }
    } catch (fallbackError) {
      console.error('Error in fallback localStorage check:', fallbackError);
    }
    
    // Return a meaningful error
    return { 
      status: 'error', 
      message: 'Failed to retrieve payment data: ' + (error.message || 'Unknown error') 
    };
  }
};

// Get lightweight cart data for payment
export const getLightweightCartData = async () => {
  try {
    console.log('Fetching lightweight cart data for payment...');
    const response = await api.get('/api/cart/lightweight');
    console.log('Lightweight cart data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching lightweight cart data:', error);
    throw error;
  }
};

export default {
  getCartItems,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  applyCoupon,
  calculateShipping,
  savePaymentData,
  getPaymentData,
  getLightweightCartData
}; 