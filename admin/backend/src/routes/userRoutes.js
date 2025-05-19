const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  verifyUser,
  directStatusUpdate,
  debugStatusUpdate,
  forceStatusUpdate
} = userController;

// Get all users and create new user
router.route('/')
  .get(getUsers)
  .post(createUser);

// Verify user - this needs to be before the /:id route to avoid conflicts
router.put('/:id/verify', verifyUser);

// Get, update, delete user by ID
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

// Add the directStatusUpdate route
router.put('/:id/status', directStatusUpdate);

// Add the forceStatusUpdate route
router.put('/:id/force-status', forceStatusUpdate);

// Add a debug route for troubleshooting
router.post('/:id/debug-status', debugStatusUpdate);

module.exports = router; 