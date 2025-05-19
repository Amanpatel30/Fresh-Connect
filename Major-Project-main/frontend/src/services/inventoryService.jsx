import api from './api';

// Get inventory items
export const getInventoryItems = async () => {
  try {
    console.log("Fetching inventory items...");
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/api/inventory', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Inventory items response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }
};

// Add inventory item
export const addInventoryItem = async (itemData) => {
  try {
    console.log("Adding inventory item with data:", itemData);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    // Format the item data
    const formattedData = {
      ...itemData,
      // Ensure quantity is a number
      quantity: parseInt(itemData.quantity, 10) || 0,
      // Ensure price is a number
      price: parseFloat(itemData.price) || 0
    };
    
    console.log("Formatted item data:", formattedData);
    
    const response = await api.post('/api/inventory', formattedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Add inventory item response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error;
  }
};

// Update inventory item
export const updateInventoryItem = async (itemId, itemData) => {
  try {
    console.log(`Updating inventory item with ID: ${itemId}`);
    console.log("Update data:", itemData);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    // Format the item data
    const formattedData = {
      ...itemData,
      // Ensure quantity is a number
      quantity: parseInt(itemData.quantity, 10) || 0,
      // Ensure price is a number
      price: parseFloat(itemData.price) || 0
    };
    
    console.log("Formatted update data:", formattedData);
    
    const response = await api.put(`/api/inventory/${itemId}`, formattedData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Update inventory item response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating inventory item with ID: ${itemId}`, error);
    throw error;
  }
};

// Delete inventory item
export const deleteInventoryItem = async (itemId) => {
  try {
    console.log(`Deleting inventory item with ID: ${itemId}`);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.delete(`/api/inventory/${itemId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Delete inventory item response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting inventory item with ID: ${itemId}`, error);
    throw error;
  }
};

export default {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
}; 