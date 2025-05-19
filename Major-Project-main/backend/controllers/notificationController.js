import Notification from '../models/Notification.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  // Log the user making the request
  console.log('Getting notifications for user:', req.user?._id);
  console.log('User object:', JSON.stringify(req.user));
  
  // Log the Notification model to check if it's properly imported
  console.log('Notification model exists:', !!Notification);
  console.log('Notification model name:', Notification.modelName);
  console.log('Notification collection name:', Notification.collection.name);
  
  try {
    // First try to find without any filters to verify the collection has data
    const allNotifications = await Notification.find({}).limit(2);
    console.log('Sample from all notifications (no filter):', 
      allNotifications.length > 0 ? JSON.stringify(allNotifications[0]) : 'No notifications in collection');
    console.log('Total notifications in collection:', allNotifications.length);
  
    // Modified to also check seller ID to support notifications for sellers
    const notifications = await Notification.find({ 
      $or: [
        { user: req.user?._id },
        { seller: req.user?._id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${notifications.length} notifications for this user`);
    if (notifications.length > 0) {
      console.log('First notification:', JSON.stringify(notifications[0]));
    } else {
      console.log('Query used:', JSON.stringify({ 
        $or: [
          { user: req.user?._id },
          { seller: req.user?._id }
        ]
      }));
    }
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      data: []
    });
  }
});

// @desc    Get all notifications without user filtering (for testing)
// @route   GET /api/notifications/all
// @access  Private
const getAllNotifications = asyncHandler(async (req, res) => {
  console.log('Getting all notifications (bypass user filter)');
  
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(20);
  
  console.log(`Found ${notifications.length} total notifications in database`);
  res.status(200).json({
    success: true,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Make sure notification belongs to logged in user
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  notification.isRead = true;
  await notification.save();
  
  res.status(200).json({ message: 'Notification marked as read' });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );
  
  res.status(200).json({ message: 'All notifications marked as read' });
});

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private
const createNotification = asyncHandler(async (req, res) => {
  const { message, type, relatedId } = req.body;
  
  const notification = await Notification.create({
    user: req.user._id,
    message,
    type: type || 'system',
    relatedId,
  });
  
  res.status(201).json(notification);
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Make sure notification belongs to logged in user
  if (notification.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  await Notification.deleteOne({ _id: req.params.id });
  
  res.status(200).json({ message: 'Notification removed' });
});

export {
  getNotifications,
  getAllNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
}; 