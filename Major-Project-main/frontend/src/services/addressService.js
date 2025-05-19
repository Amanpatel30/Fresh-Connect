import api from './api';

export const getUserAddresses = async () => {
  try {
    const response = await api.get('/user/addresses');
    return response.data;
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    throw error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await api.post('/user/addresses', addressData);
    return response.data;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`/user/addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/user/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`/user/addresses/${addressId}/default`);
    return response.data;
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

export const getDefaultAddress = async () => {
  try {
    const response = await api.get('/user/addresses/default');
    return response.data;
  } catch (error) {
    console.error('Error fetching default address:', error);
    throw error;
  }
};

export const validateAddress = async (addressData) => {
  try {
    const response = await api.post('/user/addresses/validate', addressData);
    return response.data;
  } catch (error) {
    console.error('Error validating address:', error);
    throw error;
  }
}; 