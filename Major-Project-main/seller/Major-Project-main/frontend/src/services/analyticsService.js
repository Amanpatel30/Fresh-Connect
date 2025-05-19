import api from './api';

// Get dashboard analytics data
export const getDashboardAnalytics = async () => {
  try {
    const response = await api.get('seller/analytics/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};

// Get sales analytics data
export const getSalesAnalytics = async () => {
  try {
    const response = await api.get('seller/analytics/sales');
    return response.data;
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    throw error;
  }
};

// Get specific period analytics (e.g., weekly, monthly)
export const getPeriodAnalytics = async (period) => {
  try {
    const response = await api.get(`seller/analytics/period/${period}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${period} analytics:`, error);
    throw error;
  }
};

// Get product performance analytics
export const getProductPerformance = async () => {
  try {
    const response = await api.get('seller/analytics/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching product performance:', error);
    throw error;
  }
};

// Get customer analytics
export const getCustomerAnalytics = async () => {
  try {
    const response = await api.get('seller/analytics/customers');
    return response.data;
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    throw error;
  }
};

// Get revenue breakdown
export const getRevenueBreakdown = async (timeFrame = 'month') => {
  try {
    const response = await api.get(`seller/analytics/revenue?timeFrame=${timeFrame}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error);
    throw error;
  }
}; 