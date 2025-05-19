import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all feedback for the currently authenticated hotel
router.get('/hotel', protect, async (req, res) => {
  try {
    // Get the hotel ID from the authenticated user
    const hotelId = req.user._id;
    
    if (!hotelId) {
      return res.status(400).json({ message: 'Hotel ID not found in authentication' });
    }
    
    console.log(`Fetching feedback for hotel ID: ${hotelId}`);
    
    // Fetch feedback with populated user information
    const feedbacks = await Feedback.find({ hotel: hotelId })
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log(`Found ${feedbacks.length} feedback items`);
    
    // If no feedback is found, return an empty array instead of an error
    res.status(200).json(feedbacks || []);
  } catch (error) {
    console.error('Error fetching feedback for authenticated hotel:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
});

// Get all feedback for a specific hotel
router.get('/hotel/:hotelId', protect, async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    // Fetch feedback with populated user information
    const feedbacks = await Feedback.find({ hotel: hotelId })
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
});

// Get a single feedback by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching feedback with ID: ${id}`);
    
    const feedback = await Feedback.findById(id)
      .populate('user', 'name email profileImage');
    
    if (!feedback) {
      console.error(`Feedback with ID ${id} not found`);
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if the authenticated user is the hotel that received the feedback
    if (feedback.hotel.toString() !== req.user._id.toString()) {
      console.error(`Unauthorized: User ${req.user._id} attempting to access feedback for hotel ${feedback.hotel}`);
      return res.status(403).json({ message: 'You are not authorized to access this feedback' });
    }
    
    console.log(`Successfully fetched feedback with ID: ${id}`);
    res.status(200).json(feedback);
  } catch (error) {
    console.error(`Error fetching feedback with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
});

// Create new feedback
router.post('/', protect, async (req, res) => {
  try {
    const { hotelId, rating, comment, categories } = req.body;
    
    if (!hotelId || !rating || !comment) {
      return res.status(400).json({ message: 'Please provide hotel ID, rating and comment' });
    }
    
    const feedback = new Feedback({
      user: req.user._id,
      hotel: hotelId,
      rating,
      comment,
      categories: categories || [],
      verified: true // Assuming the user has verified stay
    });
    
    const savedFeedback = await feedback.save();
    
    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ message: 'Server error while creating feedback' });
  }
});

// Add reply to feedback
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    
    console.log(`Responding to feedback ${id} with reply: ${reply}`);
    
    if (!reply) {
      console.error('No reply provided in request body');
      return res.status(400).json({ message: 'Please provide a reply' });
    }
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      console.error(`Feedback with ID ${id} not found`);
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if the authenticated user is the hotel that received the feedback
    if (feedback.hotel.toString() !== req.user._id.toString()) {
      console.error(`Unauthorized: User ${req.user._id} attempting to respond to feedback for hotel ${feedback.hotel}`);
      return res.status(403).json({ message: 'You are not authorized to respond to this feedback' });
    }
    
    feedback.reply = reply;
    feedback.replyDate = Date.now();
    feedback.status = 'responded';
    
    const updatedFeedback = await feedback.save();
    console.log(`Successfully responded to feedback ${id}`);
    
    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error(`Error responding to feedback ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error while responding to feedback' });
  }
});

// Mark feedback as resolved
router.post('/:id/resolve', protect, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Marking feedback ${id} as resolved`);
    
    // Find the feedback by ID
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      console.error(`Feedback with ID ${id} not found`);
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    // Check if the authenticated user is the hotel that received the feedback
    if (feedback.hotel.toString() !== req.user._id.toString()) {
      console.error(`Unauthorized: User ${req.user._id} attempting to resolve feedback for hotel ${feedback.hotel}`);
      return res.status(403).json({ message: 'You are not authorized to resolve this feedback' });
    }
    
    // Update the status to resolved
    feedback.status = 'resolved';
    
    // Save the updated feedback
    const updatedFeedback = await feedback.save();
    console.log(`Feedback ${id} marked as resolved successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Feedback marked as resolved',
      feedback: updatedFeedback
    });
  } catch (error) {
    console.error('Error resolving feedback:', error);
    res.status(500).json({ message: 'Server error while resolving feedback' });
  }
});

export default router; 