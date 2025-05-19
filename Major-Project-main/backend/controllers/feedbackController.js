import asyncHandler from 'express-async-handler';
import Feedback from '../models/Feedback.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';

// @desc    Create a new feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = asyncHandler(async (req, res) => {
  const { hotelId, rating, comment, orderReference, isPublic } = req.body;

  // Validate input
  if (!hotelId || !rating || !comment) {
    res.status(400);
    throw new Error('Please provide hotel, rating and comment');
  }

  // Check if hotel exists
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  // Create feedback
  const feedback = await Feedback.create({
    user: req.user._id,
    hotel: hotelId,
    rating,
    comment,
    orderReference: orderReference || null,
    isPublic: isPublic !== undefined ? isPublic : true,
  });

  if (feedback) {
    // Update hotel rating
    const allFeedbacks = await Feedback.find({ hotel: hotelId });
    const totalRating = allFeedbacks.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allFeedbacks.length;
    
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: averageRating.toFixed(1),
      numReviews: allFeedbacks.length,
    });

    console.log(`Feedback created successfully: ${feedback._id}`);
    res.status(201).json(feedback);
  } else {
    console.error('Failed to create feedback');
    res.status(400);
    throw new Error('Invalid feedback data');
  }
});

// @desc    Get all feedbacks for a hotel
// @route   GET /api/feedback/hotel/:id
// @access  Public
const getHotelFeedbacks = asyncHandler(async (req, res) => {
  const hotelId = req.params.id;
  
  // Check if hotel exists
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    res.status(404);
    throw new Error('Hotel not found');
  }

  // Get feedbacks
  const feedbacks = await Feedback.find({ 
    hotel: hotelId,
    isPublic: true 
  })
  .populate('user', 'name')
  .sort({ createdAt: -1 });

  console.log(`Retrieved ${feedbacks.length} feedbacks for hotel: ${hotelId}`);
  res.json(feedbacks);
});

// @desc    Get all feedbacks for logged in hotel
// @route   GET /api/feedback/my-hotel
// @access  Private (Hotel)
const getMyHotelFeedbacks = asyncHandler(async (req, res) => {
  // Get feedbacks
  const feedbacks = await Feedback.find({ hotel: req.user._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  console.log(`Retrieved ${feedbacks.length} feedbacks for hotel: ${req.user._id}`);
  res.json(feedbacks);
});

// @desc    Respond to a feedback
// @route   PUT /api/feedback/:id/respond
// @access  Private (Hotel)
const respondToFeedback = asyncHandler(async (req, res) => {
  const { response } = req.body;
  
  if (!response) {
    res.status(400);
    throw new Error('Please provide a response');
  }

  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if hotel owns this feedback
  if (feedback.hotel.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to respond to this feedback');
  }

  feedback.response = {
    text: response,
    date: Date.now(),
  };
  feedback.status = 'responded';

  const updatedFeedback = await feedback.save();
  
  console.log(`Response added to feedback: ${feedback._id}`);
  res.json(updatedFeedback);
});

// @desc    Mark feedback as resolved
// @route   PUT /api/feedback/:id/resolve
// @access  Private (Hotel)
const resolveFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if hotel owns this feedback
  if (feedback.hotel.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to resolve this feedback');
  }

  feedback.status = 'resolved';
  const updatedFeedback = await feedback.save();
  
  console.log(`Feedback marked as resolved: ${feedback._id}`);
  res.json(updatedFeedback);
});

// @desc    Delete a feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin or User who created the feedback)
const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);
  
  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Check if user owns this feedback only
  if (feedback.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this feedback');
  }

  await feedback.remove();
  
  // Update hotel rating
  const hotelId = feedback.hotel;
  const allFeedbacks = await Feedback.find({ hotel: hotelId });
  
  if (allFeedbacks.length > 0) {
    const totalRating = allFeedbacks.reduce((sum, item) => sum + item.rating, 0);
    const averageRating = totalRating / allFeedbacks.length;
    
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: averageRating.toFixed(1),
      numReviews: allFeedbacks.length,
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: 0,
      numReviews: 0,
    });
  }
  
  console.log(`Feedback deleted: ${feedback._id}`);
  res.json({ message: 'Feedback removed' });
});

export {
  createFeedback,
  getHotelFeedbacks,
  getMyHotelFeedbacks,
  respondToFeedback,
  resolveFeedback,
  deleteFeedback,
}; 