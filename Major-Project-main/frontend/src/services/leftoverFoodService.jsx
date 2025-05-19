import api, { getMyLeftoverFood, addLeftoverFood, updateLeftoverFood, deleteLeftoverFood } from './api';

// Get all listings with pagination and filters
export const getListings = async (page = 1, status = 'available', category = '', search = '') => {
  try {
    const response = await api.get(`/api/leftover-food?page=${page}&status=${status}&category=${category}&search=${search}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all listings:', error);
    throw error;
  }
};

// Get hotel owner's listings with pagination and filters
export const getMyListings = async (page = 1, limit = 10, category = '', search = '', status = '') => {
  try {
    // Build query params with explicit category filtering
    const params = new URLSearchParams();
    
    // Add pagination params
    params.append('page', page);
    params.append('limit', limit);
    
    // Add category filter - only if it has a value
    if (category && category.trim() !== '') {
      params.append('category', category.trim().toLowerCase());
      console.log('Filtering by exact category:', category.trim().toLowerCase());
    }
    
    // Add search filter
    if (search && search.trim() !== '') {
      params.append('search', search.trim());
    }
    
    // Add status filter
    if (status && status.trim() !== '') {
      params.append('status', status.trim().toLowerCase());
      console.log('Filtering by exact status:', status.trim().toLowerCase());
    }
    
    // Construct the URL with query parameters
    const queryString = params.toString();
    const url = `/api/leftover-food/my-listings${queryString ? `?${queryString}` : ''}`;
    
    console.log('Making API request to:', url);
    
    const response = await api.get(url);
    
    // Log the response data for debugging
    console.log('API response for my listings:', {
      totalItems: response.data.total,
      itemCount: response.data.items?.length || 0,
      categoryFilter: category || 'none',
      statusFilter: status || 'none',
      itemCategories: response.data.items?.map(item => item.category) || []
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching my listings:', error);
    
    // Provide more detailed error information
    if (error.response) {
      console.error('Server responded with error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
};

// Get single listing
export const getListing = async (id) => {
  try {
    const response = await api.get(`/api/leftover-food/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching listing with id ${id}:`, error);
    throw error;
  }
};

// Create new listing
export const createListing = async (listingData) => {
  try {
    console.log('Creating new leftover food listing with data:', listingData);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    // Ensure the data is properly formatted
    const formattedData = {
      ...listingData,
      // Ensure price is a number
      price: parseFloat(listingData.price) || 0,
      // Ensure expiryTime is properly formatted
      expiryTime: listingData.expiryTime instanceof Date 
        ? listingData.expiryTime.toISOString() 
        : listingData.expiryTime
    };
    
    console.log('Formatted create data:', formattedData);
    
    // Make the API call to create a new listing
    const response = await api.post('/api/leftover-food', formattedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Create listing response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

// Update existing listing
export const updateListing = async (id, listingData) => {
  try {
    console.log(`Updating leftover food listing with ID: ${id}`);
    console.log('Update data:', listingData);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    // Ensure the data is properly formatted
    const formattedData = {
      ...listingData,
      // Ensure price is a number
      price: parseFloat(listingData.price) || 0,
      // Ensure expiryTime is properly formatted
      expiryTime: listingData.expiryTime instanceof Date 
        ? listingData.expiryTime.toISOString() 
        : listingData.expiryTime
    };
    
    console.log('Formatted update data:', formattedData);
    
    // Make the API call to update the listing
    const response = await api.put(`/api/leftover-food/${id}`, formattedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Update listing response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating listing with ID ${id}:`, error);
    throw error;
  }
};

// Delete listing
export const deleteListing = async (id) => {
  try {
    console.log(`Deleting leftover food listing with ID: ${id}`);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    // Make the API call to delete the listing
    const response = await api.delete(`/api/leftover-food/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Delete listing response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting listing with ID ${id}:`, error);
    throw error;
  }
};

// Update listing status
export const updateListingStatus = async (id, status) => {
  try {
    console.log(`Updating status of leftover food listing with ID: ${id} to ${status}`);
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }
    
    // Use PATCH endpoint specifically for status updates
    const response = await api.patch(`/api/leftover-food/${id}/status`, 
      { status }, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Update status response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating status of listing with ID ${id}:`, error);
    throw error;
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    // Try the test endpoint
    const testResponse = await api.get('/api/test');
    console.log('API test endpoint response:', testResponse.data);
    return {
      success: true,
      testResponse: testResponse.data
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 