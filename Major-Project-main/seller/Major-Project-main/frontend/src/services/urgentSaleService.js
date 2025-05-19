import api from './api';

// Get all urgent sales with optional filters
export const getUrgentSales = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/seller/urgent-sales?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching urgent sales:', error);
    throw error;
  }
};

// Get a single urgent sale by ID
export const getUrgentSale = async (id) => {
  try {
    const response = await api.get(`/seller/urgent-sales/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching urgent sale ${id}:`, error);
    throw error;
  }
};

// Create a new urgent sale
export const createUrgentSale = async (saleData) => {
  try {
    const response = await api.post('/seller/urgent-sales', saleData);
    return response.data;
  } catch (error) {
    console.error('Error creating urgent sale:', error);
    throw error;
  }
};

// Update an existing urgent sale
export const updateUrgentSale = async (id, saleData) => {
  try {
    const response = await api.patch(`/seller/urgent-sales/${id}`, saleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating urgent sale ${id}:`, error);
    throw error;
  }
};

// Delete an urgent sale
export const deleteUrgentSale = async (id) => {
  try {
    const response = await api.delete(`/seller/urgent-sales/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting urgent sale ${id}:`, error);
    throw error;
  }
};

// Get active urgent sales
export const getActiveUrgentSales = async () => {
  try {
    const now = new Date().toISOString();
    const response = await api.get(`/seller/urgent-sales?endDate[$gt]=${now}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active urgent sales:', error);
    throw error;
  }
};

// Get expired urgent sales
export const getExpiredUrgentSales = async () => {
  try {
    const now = new Date().toISOString();
    const response = await api.get(`/seller/urgent-sales?endDate[$lt]=${now}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expired urgent sales:', error);
    throw error;
  }
}; 