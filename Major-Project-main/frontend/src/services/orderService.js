import api from './api';

// Get all orders with optional filters
export const getOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `/api/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get a single order
export const getOrder = async (id) => {
  try {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get all seller orders with optional filters
export const getSellerOrders = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await api.get(`/api/seller/orders${queryString}`);
    console.log('Seller orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

// Get pending orders for a seller
export const getPendingOrders = async () => {
  try {
    const response = await api.get('/api/seller/orders?status=pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    throw error;
  }
};

// Get shipping orders for a seller
export const getShippingOrders = async () => {
  try {
    // First try to get both processing and shipped statuses using comma separation
    console.log('Fetching shipping orders with processing and shipped statuses');
    const response = await api.get('/api/seller/orders?status=processing,shipped');
    
    // Check if we got results
    if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      console.log('Successfully fetched shipping orders:', response.data);
    return response.data;
    }
    
    // If no results, try alternative approach with OR operator
    console.log('No shipping orders found with comma separation, trying alternative format');
    const alternativeResponse = await api.get('/api/seller/orders?status=shipped');
    console.log('Shipped orders response:', alternativeResponse.data);
    
    // If we have shipped orders, return them
    if (alternativeResponse.data && Array.isArray(alternativeResponse.data.data) && alternativeResponse.data.data.length > 0) {
      return alternativeResponse.data;
    }
    
    // If still no results, try just processing orders as they might need shipping soon
    console.log('No shipped orders found, trying processing orders');
    const processingResponse = await api.get('/api/seller/orders?status=processing');
    console.log('Processing orders response:', processingResponse.data);
    
    return processingResponse.data;
  } catch (error) {
    console.error('Error fetching shipping orders:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    // Try the first endpoint format with PATCH
    console.log(`Trying to update order status with PATCH /api/seller/orders/${orderId}/status`);
    const response = await api.patch(`/api/seller/orders/${orderId}/status`, statusData);
    console.log('Order status update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating order status (first attempt):', error);
    
    // Try other endpoint formats if the first one fails
    try {
      // Second attempt: use different endpoint format with PATCH
      console.log(`Trying to update order status with PATCH /api/orders/${orderId}/status`);
      const secondResponse = await api.patch(`/api/orders/${orderId}/status`, statusData);
      console.log('Second attempt order status update response:', secondResponse.data);
      return secondResponse.data;
    } catch (secondError) {
      console.error('Error updating order status (second attempt):', secondError);
      
      try {
        // Third attempt: try with PUT instead of PATCH
        console.log(`Trying to update order status with PUT /api/orders/${orderId}/status`);
        const thirdResponse = await api.put(`/api/orders/${orderId}/status`, statusData);
        console.log('Third attempt order status update response:', thirdResponse.data);
        return thirdResponse.data;
      } catch (thirdError) {
        console.error('Error updating order status (third attempt):', thirdError);
        
        try {
          // Fourth attempt: try with a simpler path
          console.log(`Trying to update order status with PATCH /api/orders/${orderId}`);
          const fourthResponse = await api.patch(`/api/orders/${orderId}`, statusData);
          console.log('Fourth attempt order status update response:', fourthResponse.data);
          return fourthResponse.data;
        } catch (fourthError) {
          console.error('Error updating order status (fourth attempt):', fourthError);
          
          try {
            // Fifth attempt: try without /api prefix
            console.log(`Trying to update order status with PATCH /orders/${orderId}/status`);
            const fifthResponse = await api.patch(`/orders/${orderId}/status`, statusData);
            console.log('Fifth attempt order status update response:', fifthResponse.data);
            return fifthResponse.data;
          } catch (fifthError) {
            console.error('All update order status attempts failed');
            throw fifthError;
          }
        }
      }
    }
  }
};

// Get order statistics for a seller
export const getOrderStats = async () => {
  try {
    const response = await api.get('/api/seller/orders/stats');
    console.log('Order stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

// Get all orders (not paginated) for stats
export const getAllOrders = async () => {
  try {
    // Request without pagination to get all orders for stats
    const response = await api.get('/api/seller/orders/all');
    console.log('All orders for stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders for stats:', error);
    
    // Fallback to paginated call with max limit if all orders endpoint doesn't exist
    try {
      // Try with pagination and a high limit as fallback
      const fallbackResponse = await api.get('/api/seller/orders?limit=100');
      console.log('Fallback all orders:', fallbackResponse.data);
      return fallbackResponse.data;
    } catch (fallbackError) {
      console.error('Fallback orders request failed:', fallbackError);
      throw fallbackError;
    }
  }
}; 