import api from './api';

// Get seller profile
export const getSellerProfile = async () => {
  try {
    // First try the regular endpoint
    try {
      const response = await api.get('/seller/profile');
      return response.data;
    } catch (error) {
      // If regular endpoint fails, try the debug endpoint
      if (error.response && error.response.status === 404) {
        console.log('Regular profile endpoint not found, trying debug endpoint...');
        try {
          const debugResponse = await api.get('/seller/profile/debug');
          return debugResponse.data;
        } catch (debugError) {
          console.log('Debug endpoint failed, trying test endpoint...');
          const testResponse = await api.get('/seller/profile/test');
          return testResponse.data;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    throw error;
  }
};

// Update seller profile
export const updateSellerProfile = async (profileData) => {
  try {
    const response = await api.put('/seller/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating seller profile:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (formData) => {
  try {
    const response = await api.post('/seller/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Update business documents
export const updateBusinessDocuments = async (documents) => {
  try {
    const response = await api.put('/seller/profile/documents', documents);
    return response.data;
  } catch (error) {
    console.error('Error updating business documents:', error);
    throw error;
  }
};

// Upload document file (e.g., GST certificate, PAN card, etc.)
export const uploadDocumentFile = async (file, documentType) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType); // gst, pan, fssai, etc.

    const response = await api.post('/seller/profile/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading document file:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/seller/profile/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}; 