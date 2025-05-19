import api from './api';

// Get payment transactions
export const getPaymentTransactions = async (filters = {}) => {
  try {
    // Create query parameters for filtering
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    
    const queryString = queryParams.toString();
    const url = `seller/payments/transactions${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    throw error;
  }
};

// Get payment summary
export const getPaymentSummary = async () => {
  try {
    const response = await api.get('seller/payments/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    throw error;
  }
};

// Request payout
export const requestPayout = async (amount, paymentMethod) => {
  try {
    const response = await api.post('seller/payments/request-payout', { amount, paymentMethod });
    return response.data;
  } catch (error) {
    console.error('Error requesting payout:', error);
    throw error;
  }
};

// Get payment methods
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('seller/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Add payment method
export const addPaymentMethod = async (paymentMethodData) => {
  try {
    const response = await api.post('seller/payment-methods', paymentMethodData);
    return response.data;
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.delete(`seller/payment-methods/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

// Get transaction by ID
export const getTransactionById = async (transactionId) => {
  try {
    const response = await api.get(`seller/payments/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};

// Get payment statistics
export const getPaymentStats = async (timeRange = 'month') => {
  try {
    const response = await api.get(`seller/payments/stats?range=${timeRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
}; 