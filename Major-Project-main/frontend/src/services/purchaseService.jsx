import api from './api';

// Get purchase history
export const getPurchaseHistory = async () => {
  try {
    console.log("Fetching purchase history...");
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/api/purchases/history', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Purchase history response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    throw error;
  }
};

// Get purchase details
export const getPurchaseDetails = async (purchaseId) => {
  try {
    console.log(`Fetching details for purchase ID: ${purchaseId}`);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.get(`/api/purchases/${purchaseId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Purchase details response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for purchase ID: ${purchaseId}`, error);
    throw error;
  }
};

// Create a new purchase
export const createPurchase = async (purchaseData) => {
  try {
    console.log("Creating new purchase with data:", purchaseData);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.post('/api/purchases', purchaseData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("New purchase response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating new purchase:", error);
    throw error;
  }
};

// Update purchase status
export const updatePurchaseStatus = async (purchaseId, status) => {
  try {
    console.log(`Updating status for purchase ID: ${purchaseId} to: ${status}`);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.patch(`/api/purchases/${purchaseId}/status`, { status }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Purchase status update response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating status for purchase ID: ${purchaseId}`, error);
    throw error;
  }
};

export default {
  getPurchaseHistory,
  getPurchaseDetails,
  createPurchase,
  updatePurchaseStatus
}; 