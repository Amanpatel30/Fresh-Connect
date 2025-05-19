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
    const url = `/orders${queryString ? `?${queryString}` : ''}`;
    
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
    const response = await api.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Get all seller orders with optional filters
export const getSellerOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = `/seller/orders${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    throw error;
  }
};

// Get pending orders for a seller
export const getPendingOrders = async () => {
  try {
    const response = await api.get('/seller/orders?status=pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    throw error;
  }
};

// Get shipping orders for a seller
export const getShippingOrders = async () => {
  try {
    const response = await api.get('/seller/orders?status=processing,shipped');
    return response.data;
  } catch (error) {
    console.error('Error fetching shipping orders:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.put(`/seller/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get order statistics for a seller
export const getOrderStats = async () => {
  try {
    const response = await api.get('/seller/orders/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
}; 