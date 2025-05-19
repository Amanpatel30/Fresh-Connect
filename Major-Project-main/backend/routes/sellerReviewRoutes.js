import express from 'express';
import { protect, sellerOnly } from '../middleware/authMiddleware.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';
import { normalizeReview, updateReviewResponse } from '../utils/reviewUtils.js';

const router = express.Router();

// IMPORTANT: Specific routes with fixed paths must come BEFORE parameterized routes

// @desc    Test route
// @route   GET /api/seller/reviews/test
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'Seller reviews API is working' });
});

// @desc    Diagnostic route to check review structure
// @route   GET /api/seller/reviews/check/:id
// @access  Private/Seller
router.get('/check/:id', protect, sellerOnly, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID format' });
    }
    
    // Get the raw review document from MongoDB
    const rawReview = await mongoose.connection.db
      .collection('reviews')
      .findOne({ _id: new mongoose.Types.ObjectId(reviewId) });
    
    // Get the review through Mongoose
    const modelReview = await Review.findById(reviewId);
    
    // Check for required fields
    const requiredFields = {
      'sellerId': !!rawReview?.sellerId,
      'customer._id': !!rawReview?.customer?._id,
      'customer.name': !!rawReview?.customer?.name,
      'product._id': !!rawReview?.product?._id,
      'product.name': !!rawReview?.product?.name,
      'rating': !!rawReview?.rating,
      'comment': !!rawReview?.comment
    };
    
    // Check which fields are missing
    const missingFields = Object.entries(requiredFields)
      .filter(([_, exists]) => !exists)
      .map(([field]) => field);
    
    res.json({
      rawReview,
      modelReview: modelReview ? modelReview.toObject() : null,
      requiredFields,
      missingFields,
      hasAllRequiredFields: missingFields.length === 0
    });
  } catch (error) {
    console.error('Error checking review:', error);
    res.status(500).json({ 
      message: 'Error checking review',
      error: error.message
    });
  }
});

// @desc    Get review statistics
// @route   GET /api/seller/reviews/stats
// @access  Private/Seller
router.get('/stats', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Convert sellerId to ObjectId
    const sellerIdObj = mongoose.Types.ObjectId.isValid(sellerId) 
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;
    
    // Get overall rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { sellerId: sellerIdObj } },
      { 
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);
    
    // Get monthly review counts for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyReviews = await Review.aggregate([
      { 
        $match: { 
          sellerId: sellerIdObj,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthlyReviews.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count,
      averageRating: parseFloat(item.averageRating.toFixed(1))
    }));
    
    // Get response rate
    const responseStats = await Review.aggregate([
      { $match: { sellerId: sellerIdObj } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          respondedReviews: { $sum: { $cond: ['$responded', 1, 0] } }
        }
      }
    ]);
    
    const responseRate = responseStats.length > 0 
      ? (responseStats[0].respondedReviews / responseStats[0].totalReviews) * 100 
      : 0;
    
    res.json({
      ratingStats: ratingStats.length > 0 ? ratingStats[0] : {
        averageRating: 0,
        totalReviews: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      },
      monthlyData,
      responseRate: parseFloat(responseRate.toFixed(1)),
      unrespondedCount: responseStats.length > 0 
        ? responseStats[0].totalReviews - responseStats[0].respondedReviews 
        : 0
    });
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all reviews for a seller
// @route   GET /api/seller/reviews
// @access  Private/Seller
router.get('/', protect, sellerOnly, async (req, res) => {
  try {
    const sellerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter = { sellerId };
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    
    if (req.query.responded === 'true') {
      filter.responded = true;
    } else if (req.query.responded === 'false') {
      filter.responded = false;
    }
    
    // Sort options
    let sort = {};
    if (req.query.sort === 'rating-high') {
      sort = { rating: -1 };
    } else if (req.query.sort === 'rating-low') {
      sort = { rating: 1 };
    } else if (req.query.sort === 'helpful') {
      sort = { helpful: -1 };
    } else {
      // Default sort by date
      sort = { date: -1 };
    }
    
    const reviews = await Review.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const totalReviews = await Review.countDocuments(filter);
    
    // Calculate average rating
    const sellerIdObj = mongoose.Types.ObjectId.isValid(sellerId) 
      ? new mongoose.Types.ObjectId(sellerId)
      : sellerId;
      
    const ratingStats = await Review.aggregate([
      { $match: { sellerId: sellerIdObj } },
      { 
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);
    
    const stats = ratingStats.length > 0 ? ratingStats[0] : {
      averageRating: 0,
      totalReviews: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0
    };
    
    res.json({
      reviews,
      page,
      pages: Math.ceil(totalReviews / limit),
      total: totalReviews,
      stats
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// IMPORTANT: Parameterized routes MUST come AFTER specific routes

// @desc    Get a single review
// @route   GET /api/seller/reviews/:id
// @access  Private/Seller
router.get('/:id', protect, sellerOnly, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Respond to a review
// @route   POST /api/seller/reviews/:id/respond
// @access  Private/Seller
router.post('/:id/respond', protect, sellerOnly, async (req, res) => {
  try {
    console.log('Responding to review. Body:', req.body);
    console.log('Review ID:', req.params.id);
    console.log('User ID:', req.user._id);
    
    const { responseText } = req.body;
    
    if (!responseText || responseText.trim() === '') {
      console.log('Response text is missing or empty');
      return res.status(400).json({ message: 'Response text is required' });
    }
    
    // Validate object ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid review ID format:', req.params.id);
      return res.status(400).json({ message: 'Invalid review ID format' });
    }
    
    try {
      // Use findById instead of findOne to ensure we get a proper Mongoose document
      let review = await Review.findById(req.params.id);
      
      if (!review) {
        console.log('Review not found with ID:', req.params.id);
        return res.status(404).json({ message: 'Review not found' });
      }
      
      // Check if seller ID matches (when available)
      if (review.sellerId) {
        const reviewSellerId = review.sellerId.toString();
        const currentUserId = req.user._id.toString();
        
        console.log('Review seller ID:', reviewSellerId);
        console.log('Current user ID:', currentUserId);
        
        // In development, allow any seller to respond to any review
        if (process.env.NODE_ENV === 'development') {
          console.log('Development mode: bypassing seller ID check');
        } else if (reviewSellerId !== currentUserId) {
          console.log('Seller ID mismatch: Not authorized to respond to this review');
          return res.status(403).json({ 
            message: 'Not authorized to respond to this review',
            reviewSellerId,
            currentUserId
          });
        }
      }
      
      // First normalize the review to ensure all required fields are present
      let normalizedReview = normalizeReview(review.toObject());
      
      // Then update the response fields
      normalizedReview.responded = true;
      normalizedReview.response = {
        text: responseText,
        date: new Date()
      };
      
      // Use findByIdAndUpdate to avoid validation issues
      try {
        const updatedReview = await Review.findByIdAndUpdate(
          req.params.id,
          normalizedReview,
          { 
            new: true,           // Return the updated document
            runValidators: false, // Don't run validators to avoid issues
            upsert: false        // Don't create if it doesn't exist
          }
        );
        
        if (!updatedReview) {
          return res.status(404).json({ message: 'Review not found after update' });
        }
        
        console.log('Review updated successfully');
        res.json(updatedReview);
      } catch (saveError) {
        console.error('Error saving review:', saveError);
        
        // As a fallback, try direct database update
        try {
          console.log('Trying direct database update as fallback');
          const result = await mongoose.connection.db.collection('reviews').updateOne(
            { _id: new mongoose.Types.ObjectId(req.params.id) },
            { 
              $set: { 
                responded: true,
                response: {
                  text: responseText,
                  date: new Date()
                }
              }
            }
          );
          
          if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Review not found for direct update' });
          }
          
          // Get the updated document
          const updatedDoc = await mongoose.connection.db.collection('reviews')
            .findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
          
          console.log('Review updated via direct database access');
          res.json(updatedDoc);
        } catch (directDbError) {
          console.error('Error with direct database update:', directDbError);
          res.status(500).json({ 
            message: 'Error updating review even with direct database access',
            error: directDbError.message
          });
        }
      }
    } catch (findError) {
      console.error('Error finding or updating review:', findError);
      res.status(500).json({ 
        message: 'Error finding or updating review',
        error: findError.message
      });
    }
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

export default router; 