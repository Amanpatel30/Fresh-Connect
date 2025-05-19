import express from 'express';
import { protect, seller } from '../middleware/authMiddleware.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';

const router = express.Router();

// IMPORTANT: Specific routes with fixed paths must come BEFORE parameterized routes

// @desc    Get review statistics
// @route   GET /api/seller/reviews/stats
// @access  Private/Seller
router.get('/stats', protect, seller, async (req, res) => {
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
router.get('/', protect, seller, async (req, res) => {
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
router.get('/:id', protect, seller, async (req, res) => {
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
router.post('/:id/respond', protect, seller, async (req, res) => {
  try {
    const { responseText } = req.body;
    
    if (!responseText || responseText.trim() === '') {
      return res.status(400).json({ message: 'Response text is required' });
    }
    
    const review = await Review.findOne({
      _id: req.params.id,
      sellerId: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    review.responded = true;
    review.response = {
      text: responseText,
      date: new Date()
    };
    
    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 