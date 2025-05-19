import api from './api';

// Get all payment methods
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/seller/payment-methods');
    return response.data;
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
};

// Get a single payment method
export const getPaymentMethod = async (id) => {
  try {
    const response = await api.get(`/seller/payment-methods/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment method:', error);
    throw error;
  }
};

// Create a new payment method
export const createPaymentMethod = async (paymentMethodData) => {
  try {
    const response = await api.post('/seller/payment-methods', paymentMethodData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

// Update a payment method
export const updatePaymentMethod = async (id, paymentMethodData) => {
  try {
    const response = await api.put(`/seller/payment-methods/${id}`, paymentMethodData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Delete a payment method
export const deletePaymentMethod = async (id) => {
  try {
    const response = await api.delete(`/seller/payment-methods/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (id) => {
  try {
    const response = await api.put(`/seller/payment-methods/${id}/default`);
    return response.data;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
}; 