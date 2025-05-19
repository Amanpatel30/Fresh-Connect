import api from './api';

// Get all reviews for a seller
export const getSellerReviews = async (filters = {}) => {
  try {
    // Create query parameters for filtering
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.rating) queryParams.append('rating', filters.rating);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    
    const queryString = queryParams.toString();
    const url = `seller/reviews${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    throw error;
  }
};

// Get review statistics for a seller
export const getReviewStats = async () => {
  try {
    const response = await api.get('seller/reviews/stats');
    return response;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    throw error;
  }
};

// Respond to a review
export const respondToReview = async (reviewId, responseText) => {
  try {
    const response = await api.post(`seller/reviews/${reviewId}/respond`, { responseText });
    return response;
  } catch (error) {
    console.error('Error responding to review:', error);
    throw error;
  }
};

// Report a review
export const reportReview = async (reviewId, reason) => {
  try {
    const response = await api.post(`seller/reviews/${reviewId}/report`, { reason });
    return response;
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
};

// Get customer reviews that need a response
export const getPendingResponseReviews = async () => {
  try {
    const response = await api.get('seller/reviews?responded=false');
    return response;
  } catch (error) {
    console.error('Error fetching pending response reviews:', error);
    throw error;
  }
};

// Get customer reviews for a specific product
export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`seller/products/${productId}/reviews`);
    return response;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    throw error;
  }
}; 