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
    const url = `/api/seller/reviews${queryString ? `?${queryString}` : ''}`;

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
    const response = await api.get('api/seller/reviews/stats');
    return response;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    throw error;
  }
};

// Respond to a review
export const respondToReview = async (reviewId, responseText) => {
  try {
    console.log(`Sending response for review ${reviewId}:`, responseText);
    const response = await api.post(`/api/seller/reviews/${reviewId}/respond`, { responseText });
    return response;
  } catch (error) {
    console.error('Error responding to review:', error);
    throw error;
  }
};

// Report a review
export const reportReview = async (reviewId, reason) => {
  try {
    const response = await api.post(`/api/seller/reviews/${reviewId}/report`, { reason });
    return response;
  } catch (error) {
    console.error('Error reporting review:', error);
    throw error;
  }
};

// Get customer reviews that need a response
export const getPendingResponseReviews = async () => {
  try {
    const response = await api.get('/api/seller/reviews?responded=false');
    return response;
  } catch (error) {
    console.error('Error fetching pending response reviews:', error);
    throw error;
  }
};

// Get customer reviews for a specific product
export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

// Get user's submitted reviews
export const getUserReviews = async () => {
  try {
    const response = await api.get('/user/reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

// Get products that need reviews
const getPendingReviewProducts = async () => {
  try {
    const response = await api.get('/reviews/pending');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending review products:', error);
    throw error;
  }
};

// Submit a new review
export const submitReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

// Update an existing review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Like a review
export const likeReview = async (reviewId) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
};

// Dislike a review
export const dislikeReview = async (reviewId) => {
  try {
    const response = await api.post(`/reviews/${reviewId}/dislike`);
    return response.data;
  } catch (error) {
    console.error('Error disliking review:', error);
    throw error;
  }
};

// Get review statistics for a product
export const getReviewStatistics = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/review-statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    throw error;
  }
};

// Default export containing all review service functions
export default {
  getUserReviews,
  getPendingReviewProducts,
  submitReview,
  updateReview,
  deleteReview,
  likeReview,
  dislikeReview,
  getProductReviews,
  getSellerReviews,
  getReviewStatistics
}; 