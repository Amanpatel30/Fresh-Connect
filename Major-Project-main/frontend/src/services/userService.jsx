import api from './api';

// Get user profile information
export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile...');
    const response = await api.get('/api/users/profile');
    console.log('User profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user dashboard stats
export const getUserDashboardStats = async () => {
  try {
    console.log('Fetching user dashboard stats...');
    // First try the most common endpoint
    try {
      const response = await api.get('/api/users/dashboard/stats');
      console.log('User dashboard stats response:', response.data);
      return response;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Try alternative endpoint
        const altResponse = await api.get('/api/dashboard/stats');
        console.log('User dashboard stats alt response:', altResponse.data);
        return altResponse;
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching user dashboard stats:', error);
    throw error;
  }
};

// Get user recent activity
export const getUserRecentActivity = async (limit = 5) => {
  try {
    console.log('Fetching user recent activity...');
    // Try primary endpoint
    try {
      const response = await api.get(`/api/users/activity?limit=${limit}`);
      console.log('User recent activity response:', response.data);
      return response;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Try alternative endpoint
        const altResponse = await api.get(`/api/dashboard/activity?limit=${limit}`);
        console.log('User recent activity alt response:', altResponse.data);
        return altResponse;
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching user recent activity:', error);
    throw error;
  }
};

// Get user order statistics
export const getUserOrderStats = async () => {
  try {
    console.log('Fetching user order statistics...');
    // Try primary endpoint
    try {
      const response = await api.get('/api/users/orders/stats');
      console.log('User order statistics response:', response.data);
      return response;
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // Try alternative endpoint
        const altResponse = await api.get('/api/orders/stats');
        console.log('User order statistics alt response:', altResponse.data);
        return altResponse;
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching user order statistics:', error);
    throw error;
  }
};

// Get user orders
export const getUserOrders = async () => {
  try {
    console.log('Fetching user orders...');
    const response = await api.get('/api/users/orders');
    console.log('User orders response:', response.data);
    
    // If the API returns data in nested format, extract it
    const ordersData = response.data.data || response.data;
    
    return {
      data: ordersData,
      success: true
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    // Return default data on error
    return {
      data: [],
      success: false,
      error: error.message
    };
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    console.log('Updating user profile with data:', profileData);
    const response = await api.put('/api/users/profile', profileData);
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (imageFile) => {
  try {
    console.log('Uploading profile image...', imageFile.name, imageFile.type, imageFile.size);
    
    // Create FormData
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // For debugging, log what's in the FormData
    console.log('FormData created with image file');
    
    // Array of possible endpoints to try
    const uploadEndpoints = [
      '/api/upload',
      '/api/users/upload/profile',
      '/api/users/profile/image',
      '/api/upload/image'
    ];
    
    let response = null;
    let lastError = null;
    
    // Try each endpoint until one works
    for (const endpoint of uploadEndpoints) {
      try {
        console.log(`Trying upload endpoint: ${endpoint}`);
        
        response = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com'}${endpoint}`, {
          method: 'POST',
          body: formData,
          headers: {
            // Important: Do NOT set Content-Type header when using FormData with fetch
            // The browser will set it automatically with the correct boundary
            // Only set Authorization header
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Parse response JSON
        const data = await response.json();
        
        console.log(`Upload response from ${endpoint}:`, data);
        
        if (response.ok) {
          return data;
        } else {
          console.log(`Upload failed with status ${response.status}: ${response.statusText}`);
          lastError = {
            status: response.status,
            statusText: response.statusText,
            data: data
          };
        }
      } catch (endpointError) {
        console.error(`Error with endpoint ${endpoint}:`, endpointError);
        lastError = endpointError;
      }
    }
    
    // If all endpoints failed, try direct upload as a last resort
    try {
      console.log('Trying direct image upload as last resort...');
      
      // Create a minimal form data with just the image
      const simpleFormData = new FormData();
      simpleFormData.append('file', imageFile); // Try 'file' instead of 'image'
      simpleFormData.append('type', 'profile'); // Hint that this is a profile image
      
      // Make a direct fetch call with minimal headers
      const directResponse = await fetch(`${import.meta.env.VITE_BASE_URL || 'http://https://fresh-connect-backend.onrender.com'}/upload`, {
        method: 'POST',
        body: simpleFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        console.log('Direct upload succeeded:', data);
        return data;
      }
    } catch (directError) {
      console.error('Direct upload failed:', directError);
    }
    
    // If we reached here, all attempts failed
    throw lastError || new Error('All upload attempts failed');
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Update user address
export const updateUserAddress = async (addressData) => {
  try {
    console.log('Updating user address with data:', addressData);
    const response = await api.put('/api/users/address', addressData);
    console.log('Address update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user address:', error);
    throw error;
  }
};

// Delete user address
export const deleteUserAddress = async (addressId) => {
  try {
    console.log('Deleting user address with ID:', addressId);
    const response = await api.delete(`/api/users/address/${addressId}`);
    console.log('Address delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting user address:', error);
    throw error;
  }
};

// Update user payment method
export const updateUserPaymentMethod = async (paymentData) => {
  try {
    console.log('Updating user payment method with data:', paymentData);
    const response = await api.put('/api/users/payment', paymentData);
    console.log('Payment method update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user payment method:', error);
    throw error;
  }
};

// Delete user payment method
export const deleteUserPaymentMethod = async (paymentId) => {
  try {
    console.log('Deleting user payment method with ID:', paymentId);
    const response = await api.delete(`/api/users/payment/${paymentId}`);
    console.log('Payment method delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting user payment method:', error);
    throw error;
  }
};

// Update user notification settings
export const updateNotificationSettings = async (settingsData) => {
  try {
    console.log('Updating notification settings with data:', settingsData);
    const response = await api.put('/api/users/notifications', settingsData);
    console.log('Notification settings update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};

// Change user password
export const changeUserPassword = async (passwordData) => {
  try {
    console.log('Changing user password...');
    const response = await api.put('/api/users/password', passwordData);
    console.log('Password change response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error changing user password:', error);
    throw error;
  }
};

// Verify current password
export const verifyCurrentPassword = async (passwordData) => {
  try {
    console.log('Verifying current password...');
    const response = await api.post('/api/users/verify-password', passwordData);
    console.log('Password verification response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error verifying current password:', error);
    if (error.response?.status === 401) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }
    throw error;
  }
};

export default {
  getUserProfile,
  getUserDashboardStats,
  getUserRecentActivity,
  getUserOrderStats,
  getUserOrders,
  updateUserProfile,
  updateUserAddress,
  deleteUserAddress,
  updateUserPaymentMethod,
  deleteUserPaymentMethod,
  updateNotificationSettings,
  changeUserPassword,
  uploadProfileImage,
  verifyCurrentPassword
}; 