import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register user
export const register = catchAsync(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      status: 'fail',
      message: 'User already exists'
    });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'user' // Default role
  });

  if (user) {
    res.status(201).json({
      status: 'success',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: generateToken(user._id)
      }
    });
  }
});

// Login user
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Email not registered'
    });
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect password'
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    }
  });
});

// Get user profile
export const getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user) {
    res.status(200).json({
      status: 'success',
      data: user
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }
});

// Update user profile
export const updateProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Update address if provided
    if (req.body.address) {
      user.address = {
        ...user.address,
        ...req.body.address
      };
    }

    // Update seller specific fields if user is a seller
    if (user.role === 'seller') {
      user.shopName = req.body.shopName || user.shopName;
      user.shopDescription = req.body.shopDescription || user.shopDescription;
      user.shopImage = req.body.shopImage || user.shopImage;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        token: generateToken(updatedUser._id)
      }
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'User not found'
    });
  }
});