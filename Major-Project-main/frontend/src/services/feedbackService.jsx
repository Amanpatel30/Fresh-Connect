import api from './api';

// Get all feedback received by the hotel
export const getHotelFeedback = async () => {
  try {
    console.log("Fetching hotel feedback...");
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.get('/api/feedback/hotel', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Hotel feedback response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching hotel feedback:", error);
    throw error;
  }
};

// Get feedback by ID
export const getFeedbackById = async (feedbackId) => {
  try {
    console.log(`Fetching feedback with ID: ${feedbackId}`);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.get(`/api/feedback/${feedbackId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Feedback details response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching feedback with ID: ${feedbackId}`, error);
    throw error;
  }
};

// Respond to feedback
export const respondToFeedback = async (feedbackId, responseText) => {
  try {
    console.log(`Responding to feedback with ID: ${feedbackId}`);
    console.log("Response text:", responseText);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const apiResponse = await api.post(`/api/feedback/${feedbackId}/respond`, { 
      reply: responseText 
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Feedback response result:", apiResponse.data);
    return apiResponse.data.feedback || apiResponse.data;
  } catch (error) {
    console.error(`Error responding to feedback with ID: ${feedbackId}`, error);
    throw error;
  }
};

// Mark feedback as resolved
export const resolveFeedback = async (feedbackId) => {
  try {
    console.log(`Marking feedback with ID: ${feedbackId} as resolved`);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.post(`/api/feedback/${feedbackId}/resolve`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Feedback resolution response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Error resolving feedback with ID: ${feedbackId}`, error);
    throw error;
  }
};

// Submit feedback as a user
export const submitFeedback = async (feedbackData) => {
  try {
    console.log("Submitting feedback with data:", feedbackData);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      throw new Error('Authentication required');
    }
    
    const response = await api.post('/api/feedback', feedbackData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Submit feedback response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

export default {
  getHotelFeedback,
  getFeedbackById,
  respondToFeedback,
  resolveFeedback,
  submitFeedback
}; 