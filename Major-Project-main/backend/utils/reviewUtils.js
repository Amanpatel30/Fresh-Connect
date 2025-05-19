import mongoose from 'mongoose';

/**
 * Ensures a review object has all required fields by adding defaults where needed
 * 
 * @param {Object} review - The review object to normalize
 * @returns {Object} - The normalized review object
 */
export const normalizeReview = (review) => {
  if (!review) return null;
  
  const normalizedReview = { ...review };
  
  // Ensure customer exists
  if (!normalizedReview.customer) {
    normalizedReview.customer = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Unknown Customer',
      image: '/uploads/avatars/default.jpg'
    };
  } else {
    // Ensure customer fields
    if (!normalizedReview.customer._id) {
      normalizedReview.customer._id = new mongoose.Types.ObjectId();
    }
    if (!normalizedReview.customer.name) {
      normalizedReview.customer.name = 'Unknown Customer';
    }
    if (!normalizedReview.customer.image) {
      normalizedReview.customer.image = '/uploads/avatars/default.jpg';
    }
  }
  
  // Ensure product exists
  if (!normalizedReview.product) {
    normalizedReview.product = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Unknown Product',
      image: '/uploads/products/default.jpg'
    };
  } else {
    // Ensure product fields
    if (!normalizedReview.product._id) {
      normalizedReview.product._id = new mongoose.Types.ObjectId();
    }
    if (!normalizedReview.product.name) {
      normalizedReview.product.name = 'Unknown Product';
    }
    if (!normalizedReview.product.image) {
      normalizedReview.product.image = '/uploads/products/default.jpg';
    }
  }
  
  // Ensure other required fields
  if (!normalizedReview.rating) {
    normalizedReview.rating = 5; // Default to 5 stars
  }
  
  if (!normalizedReview.comment) {
    normalizedReview.comment = 'No comment provided';
  }
  
  if (!normalizedReview.date) {
    normalizedReview.date = new Date();
  }
  
  return normalizedReview;
};

/**
 * Safely updates a review with response information
 * 
 * @param {Object} review - The review mongoose document
 * @param {String} responseText - The text of the response
 * @returns {Object} - The updated review object
 */
export const updateReviewResponse = (review, responseText) => {
  if (!review) return null;
  
  // Normalize the review first
  const normalizedReview = normalizeReview(review);
  
  // Add response data
  normalizedReview.responded = true;
  normalizedReview.response = {
    text: responseText,
    date: new Date()
  };
  
  return normalizedReview;
};

export default {
  normalizeReview,
  updateReviewResponse
}; 