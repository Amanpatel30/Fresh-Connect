const User = require('../models/User');
const mongoose = require('mongoose');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    // If role query parameter is provided, filter by role
    const query = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    console.log(`[updateUser] Request to update user ${userId}`, updates);
    
    // If updating status, ensure isActive is synchronized
    if (updates.status) {
      updates.isActive = updates.status === 'Active';
      console.log(`[updateUser] Setting isActive to ${updates.isActive} based on status ${updates.status}`);
    }
    
    // If updating isActive, ensure status is synchronized
    if (updates.isActive !== undefined && !updates.status) {
      updates.status = updates.isActive ? 'Active' : 'Inactive';
      console.log(`[updateUser] Setting status to ${updates.status} based on isActive ${updates.isActive}`);
    }
    
    // Use updateOne directly to bypass validation issues
    const result = await User.updateOne(
      { _id: userId },
      { $set: updates }
    );
    
    console.log(`[updateUser] Update result:`, result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch the updated user to return in response
    const updatedUser = await User.findById(userId);
    
    console.log(`[updateUser] Updated user:`, {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      status: updatedUser.status,
      isActive: updatedUser.isActive
    });
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('[updateUser] Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify user
exports.verifyUser = async (req, res) => {
  try {
    console.log('Verifying user:', req.params.id);
    console.log('Request body:', req.body);
    
    const { isVerified, verificationNotes, verificationRejected, isPremium } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }
    
    // Update verification status
    user.isVerified = isVerified;
    user.verificationNotes = verificationNotes || '';
    user.verificationRejected = verificationRejected || false;
    user.isPremium = isPremium || false;
    
    if (isVerified) {
      user.verifiedAt = new Date();
    }
    
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    
    console.log('User verification updated successfully:', updatedUser);
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(400).json({ 
      success: false,
      message: error.message
    });
  }
};

const directStatusUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    console.log(`[directStatusUpdate] Request to update user ${userId} status to ${status}`);
    
    if (!status || !['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value. Must be Active, Inactive, or Suspended' 
      });
    }
    
    // Set isActive based on status
    const isActive = status === 'Active';
    
    // Get MongoDB native connection from mongoose
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);
    
    // Direct update using MongoDB driver
    const result = await usersCollection.updateOne(
      { _id: objectId },
      { $set: { status, isActive } }
    );
    
    console.log(`[directStatusUpdate] Update result:`, result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch updated user
    const updatedUser = await usersCollection.findOne({ _id: objectId });
    
    console.log(`[directStatusUpdate] Updated user status for ${updatedUser.name} (${updatedUser.email})`);
    console.log(`  New status: ${updatedUser.status}, isActive: ${updatedUser.isActive}`);
    
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('[directStatusUpdate] Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Simple debug endpoint for status updates
const debugStatusUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    console.log(`[debugStatusUpdate] Request received for user ${userId}`);
    console.log(`[debugStatusUpdate] Status from request:`, status);
    console.log(`[debugStatusUpdate] Request headers:`, req.headers);
    console.log(`[debugStatusUpdate] Full request body:`, req.body);
    
    // Respond with a simple success message
    return res.status(200).json({ 
      message: 'Debug endpoint received request',
      receivedUserId: userId,
      receivedStatus: status
    });
  } catch (error) {
    console.error('[debugStatusUpdate] Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Force status update - completely bypasses Mongoose
exports.forceStatusUpdate = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    console.log(`[forceStatusUpdate] FORCE updating user ${userId} to status ${status}`);
    
    if (!status || !['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value. Must be Active, Inactive, or Suspended' 
      });
    }
    
    // Determine isActive value based on status
    const isActive = status === 'Active';
    
    // Get MongoDB native connection and collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);
    
    // Log user before update
    const userBefore = await usersCollection.findOne({ _id: objectId });
    
    if (!userBefore) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`[forceStatusUpdate] Found user: ${userBefore.name} (${userBefore.email})`);
    console.log(`[forceStatusUpdate] Current status: ${userBefore.status || 'undefined'}, isActive: ${userBefore.isActive}`);
    
    // Direct update using MongoDB driver with bypass option
    const updateResult = await usersCollection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          status,
          isActive,
          updatedAt: new Date()
        } 
      },
      { bypassDocumentValidation: true }
    );
    
    console.log(`[forceStatusUpdate] Update result:`, updateResult);
    
    // Verify the update by getting the user again
    const updatedUser = await usersCollection.findOne({ _id: objectId });
    
    console.log(`[forceStatusUpdate] User after update:`);
    console.log(`  Status: ${updatedUser.status}, isActive: ${updatedUser.isActive}`);
    
    // Success if values match what we set
    const success = updatedUser.status === status && updatedUser.isActive === isActive;
    
    if (success) {
      console.log(`[forceStatusUpdate] Update SUCCESSFUL`);
    } else {
      console.log(`[forceStatusUpdate] Update FAILED - values don't match what we set`);
    }
    
    // Return the updated user
    return res.status(200).json({
      success,
      user: updatedUser
    });
  } catch (error) {
    console.error('[forceStatusUpdate] Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserById: exports.getUserById,
  createUser: exports.createUser,
  updateUser: exports.updateUser,
  verifyUser: exports.verifyUser,
  deleteUser: exports.deleteUser,
  forceStatusUpdate: exports.forceStatusUpdate,
  getUsers: exports.getUsers,
  directStatusUpdate,
  debugStatusUpdate
}; 