import api from './api';

// Get user analytics data
export const getUserAnalytics = async (dateRange) => {
  try {
    console.log('Fetching user analytics data...');
    let url = '/api/users/analytics';
    
    // Add date range parameters if provided
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await api.get(url);
    console.log('User analytics response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};

// Get order analytics data
export const getOrderAnalytics = async (dateRange) => {
  try {
    console.log('Fetching order analytics data...');
    let url = '/api/users/orders/analytics';
    
    // Add date range parameters if provided
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const response = await api.get(url);
    console.log('Order analytics response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
};

// Get category analytics data
export const getCategoryAnalytics = async () => {
  try {
    console.log('Fetching category analytics data...');
    const response = await api.get('/api/users/categories/analytics');
    console.log('Category analytics response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    throw error;
  }
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
  try {
    console.log('Fetching recent orders...');
    const response = await api.get(`/api/users/orders/recent?limit=${limit}`);
    console.log('Recent orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Get order summary
export const getOrderSummary = async () => {
  try {
    console.log('Fetching order summary...');
    const response = await api.get('/api/users/orders/summary');
    console.log('Order summary response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order summary:', error);
    throw error;
  }
};

export default {
  getUserAnalytics,
  getOrderAnalytics,
  getCategoryAnalytics,
  getRecentOrders,
  getOrderSummary
}; 