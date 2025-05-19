import Settings from '../models/Settings.js';
import errorHandler from '../utils/errorHandler.js';

// @desc    Get user settings
// @route   GET /api/seller/settings
// @access  Private/Seller
export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find settings for the user or create default settings
    let settings = await Settings.findOne({ user: userId });
    
    // If no settings exist yet for this user, create default ones
    if (!settings) {
      settings = await Settings.create({
        user: userId,
        // Default values will be applied from the model schema
      });
    }
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Update general settings
// @route   PUT /api/seller/settings/general
// @access  Private/Seller
export const updateGeneralSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const generalSettings = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      { 'general': generalSettings },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.general,
      message: 'General settings updated successfully'
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Update notification settings
// @route   PUT /api/seller/settings/notifications
// @access  Private/Seller
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationSettings = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      { 'notifications': notificationSettings },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.notifications,
      message: 'Notification settings updated successfully'
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Update security settings
// @route   PUT /api/seller/settings/security
// @access  Private/Seller
export const updateSecuritySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const securitySettings = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      { 'security': securitySettings },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: settings.security,
      message: 'Security settings updated successfully'
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

// @desc    Reset all settings to default
// @route   POST /api/seller/settings/reset
// @access  Private/Seller
export const resetSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Delete existing settings
    await Settings.findOneAndDelete({ user: userId });
    
    // Create new settings with default values
    const settings = await Settings.create({
      user: userId,
      // Default values will be applied from the model schema
    });
    
    res.status(200).json({
      success: true,
      data: settings,
      message: 'Settings have been reset to default values'
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
}; 