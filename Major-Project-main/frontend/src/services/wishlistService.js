import api from './api';
import { message } from 'antd';

// Get user wishlist items
export const getWishlistItems = async () => {
  try {
    console.log('Fetching wishlist items...');
    // Try with different endpoints
    const endpoints = [
      '/api/users/wishlist',
      '/api/wishlist',
      '/user/wishlist'
    ];
    
    let response = null;
    let error = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        response = await api.get(endpoint);
        console.log(`Wishlist items response (${endpoint}):`, response.data);
        return response.data;
      } catch (err) {
        console.log(`Error with endpoint ${endpoint}:`, err.response?.status);
        error = err;
        // Continue to next endpoint if 404
        if (err.response?.status !== 404) {
          break;
        }
      }
    }
    
    // If we get here with no successful response, throw the last error
    if (!response) {
      // Handle auth errors specially
      if (error.response && error.response.status === 401) {
        console.log('Authentication error when fetching wishlist');
        message.error('Please log in to view your wishlist');
        // Let the component handle the empty state
        throw new Error('Authentication required');
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    throw error;
  }
};

// Add item to wishlist
export const addToWishlist = async (productId, productObj = null) => {
  try {
    console.log(`Adding product ${productId} to wishlist`);
    
    // Use product details that were passed directly (from UI) instead of fetching
    const productDetails = productObj || {};
    
    // Ensure productImage is properly formatted with correct field name
    let formattedProductDetails = {
      ...productDetails,
      // Ensure productImage field is explicitly set for backend storage
      productImage: productDetails.image || null
    };
    
    // Log the actual data being sent to verify it contains image
    console.log('Formatted product details for wishlist:', {
      productId,
      hasImage: !!formattedProductDetails.productImage,
      imagePreview: formattedProductDetails.productImage ? 
        formattedProductDetails.productImage.substring(0, 50) + '...' : 'none',
      name: formattedProductDetails.name,
      category: formattedProductDetails.category
    });
    
    // Try with direct endpoint first
    try {
      // Send available product details directly with explicit productImage field
      const payload = { 
        productId,
        productDetails: formattedProductDetails
      };
      
      console.log('Sending wishlist payload with image data');
      
      const response = await api.post('/user/wishlist', payload);
      console.log('Add to wishlist response (user endpoint):', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the first endpoint returns 404, try the alternative endpoint
        console.log('First endpoint not found, trying alternative...');
        
        // Send available product details directly with explicit productImage field
        const payload = { 
          productId,
          productDetails: formattedProductDetails
        };
        
        const response = await api.post('/api/wishlist', payload);
        console.log('Add to wishlist response (api endpoint):', response.data);
        return response.data;
      }
      if (error.response && error.response.status === 401) {
        message.error('Please log in to add items to your wishlist');
      }
      throw error; // Re-throw the error if it's not a 404
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Helper function to get product details - not used anymore but kept for reference
const getProductDetails = async (productId) => {
  try {
    const response = await api.get(`/api/products/${productId}`);
    console.log('Got complete product details for wishlist:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get product details for wishlist:', error);
    return null;
  }
};

// Remove item from wishlist
export const removeFromWishlist = async (productId) => {
  try {
    console.log(`Removing product ${productId} from wishlist`);
    // Try with direct endpoint first
    try {
      const response = await api.delete(`/user/wishlist/${productId}`);
      console.log('Remove from wishlist response (user endpoint):', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the first endpoint returns 404, try the alternative endpoint
        console.log('First endpoint not found, trying alternative...');
        const response = await api.delete(`/api/wishlist/${productId}`);
        console.log('Remove from wishlist response (api endpoint):', response.data);
        return response.data;
      }
      if (error.response && error.response.status === 401) {
        message.error('Please log in to manage your wishlist');
      }
      throw error; // Re-throw the error if it's not a 404
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

// Get wishlist collections/categories
export const getWishlistCollections = async () => {
  try {
    console.log('Fetching wishlist collections...');
    const response = await api.get('/api/wishlist/collections');
    console.log('Wishlist collections response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist collections:', error);
    throw error;
  }
};

// Create a wishlist collection
export const createWishlistCollection = async (collectionData) => {
  try {
    console.log('Creating wishlist collection:', collectionData);
    const response = await api.post('/api/wishlist/collections', collectionData);
    console.log('Create wishlist collection response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating wishlist collection:', error);
    throw error;
  }
};

// Move item to a collection
export const moveToCollection = async (productId, collectionId) => {
  try {
    console.log(`Moving product ${productId} to collection ${collectionId}`);
    const response = await api.put(`/api/wishlist/collections/${collectionId}/items`, { productId });
    console.log('Move to collection response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error moving item to collection:', error);
    throw error;
  }
};

// Check if a product is in the wishlist
export const isInWishlist = async (productId) => {
  try {
    console.log('Checking if product is in wishlist:', productId);
    // Try with direct endpoint first
    try {
      const response = await api.get(`/user/wishlist/check/${productId}`);
      console.log('Check wishlist response (user endpoint):', response.data);
      return response.data.isInWishlist;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the first endpoint returns 404, try the alternative endpoint
        console.log('First endpoint not found, trying alternative...');
        const response = await api.get(`/api/wishlist/check/${productId}`);
        console.log('Check wishlist response (api endpoint):', response.data);
        return response.data.isInWishlist;
      }
      if (error.response && error.response.status === 401) {
        console.log('User not authenticated for wishlist check');
        // Return false instead of throwing for better UX
        return { status: 'success', data: { inWishlist: false } };
      }
      throw error; // Re-throw the error if it's not a 404
    }
  } catch (error) {
    console.error('Error checking wishlist:', error);
    // Return false as default in case of error
    return { status: 'success', data: { inWishlist: false } };
  }
};

export const checkIfInWishlist = async (productId) => {
  try {
    // Try both endpoints to handle potential backend configuration differences
    try {
      const response = await api.get(`/user/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the first endpoint returns 404, try the alternative endpoint
        console.log('First endpoint not found, trying alternative...');
        const response = await api.get(`/api/users/wishlist/check/${productId}`);
        return response.data;
      }
      throw error; // Re-throw the error if it's not a 404
    }
  } catch (error) {
    console.error('Error checking if item is in wishlist:', error);
    throw error;
  }
};

export const moveToCart = async (productId) => {
  try {
    // Try both endpoints to handle potential backend configuration differences
    try {
      const response = await api.post(`/user/wishlist/${productId}/move-to-cart`);
      console.log('Move to cart response (user endpoint):', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the first endpoint returns 404, try the alternative endpoint
        console.log('First endpoint not found, trying alternative...');
        const response = await api.post(`/api/users/wishlist/${productId}/move-to-cart`);
        console.log('Move to cart response (api/users endpoint):', response.data);
        return response.data;
      }
      throw error; // Re-throw the error if it's not a 404
    }
  } catch (error) {
    console.error('Error moving item to cart:', error);
    throw error;
  }
};

export const clearWishlist = async () => {
  try {
    // Try both endpoints to handle potential backend configuration differences
    try {
      const response = await api.delete('/user/wishlist');
      console.log('Clear wishlist response (user endpoint):', response.data);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // If the first endpoint returns 404, try the alternative endpoint
        console.log('First endpoint not found, trying alternative...');
        const response = await api.delete('/api/users/wishlist');
        console.log('Clear wishlist response (api/users endpoint):', response.data);
        return response.data;
      }
      throw error; // Re-throw the error if it's not a 404
    }
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};

export default {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
  getWishlistCollections,
  createWishlistCollection,
  moveToCollection,
  isInWishlist,
  checkIfInWishlist,
  moveToCart,
  clearWishlist
}; 