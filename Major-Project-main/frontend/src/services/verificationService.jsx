import api from './api';

// Get verification status
export const getVerificationStatus = async () => {
  try {
    console.log("Fetching verification status...");
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/api/verification/status', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Verification status response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching verification status:", error);
    throw error;
  }
};

// Submit verification request
export const submitVerificationRequest = async (formData) => {
  try {
    console.log("Submitting verification request with data:", formData);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    // Create a new FormData object for file upload
    const data = new FormData();
    
    // Append all text fields
    data.append('hotelName', formData.hotelName);
    data.append('ownerName', formData.ownerName);
    data.append('address', formData.address);
    data.append('phoneNumber', formData.phoneNumber);
    data.append('email', formData.email);
    data.append('licenseNumber', formData.licenseNumber);
    data.append('taxId', formData.taxId);
    data.append('businessRegistrationNumber', formData.businessRegistrationNumber);
    
    // Append all files
    if (formData.licenseDocument) {
      data.append('licenseDocument', formData.licenseDocument);
    }
    
    if (formData.taxDocument) {
      data.append('taxDocument', formData.taxDocument);
    }
    
    if (formData.businessRegistrationDocument) {
      data.append('businessRegistrationDocument', formData.businessRegistrationDocument);
    }
    
    if (formData.additionalDocuments && formData.additionalDocuments.length > 0) {
      formData.additionalDocuments.forEach((file, index) => {
        data.append(`additionalDocuments`, file);
      });
    }
    
    // Make the API call with form data
    const response = await api.post('/api/verification/submit', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("Verification submission response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting verification request:", error);
    throw error;
  }
};

// Upload additional documents
export const uploadAdditionalDocuments = async (documents) => {
  try {
    console.log("Uploading additional verification documents");
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    // Create a new FormData object for file upload
    const data = new FormData();
    
    // Append all files
    if (documents && documents.length > 0) {
      documents.forEach((file, index) => {
        data.append(`documents`, file);
      });
    }
    
    // Make the API call with form data
    const response = await api.post('/api/verification/upload-documents', data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log("Additional documents upload response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading additional documents:", error);
    throw error;
  }
};

export default {
  getVerificationStatus,
  submitVerificationRequest,
  uploadAdditionalDocuments
}; 