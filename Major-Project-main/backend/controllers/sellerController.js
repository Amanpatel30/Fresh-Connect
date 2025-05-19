import asyncHandler from 'express-async-handler';
import Seller from '../models/sellerModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Register a new seller
// @route   POST /api/seller/register
// @access  Public
const registerSeller = asyncHandler(async (req, res) => {
  const {
    businessName,
    ownerName,
    email,
    password,
    phone,
    address,
    businessType,
    registrationNumber
  } = req.body;

  const sellerExists = await Seller.findOne({ email });

  if (sellerExists) {
    res.status(400);
    throw new Error('Seller already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const seller = await Seller.create({
    businessName,
    ownerName,
    email,
    password: hashedPassword,
    phone,
    address,
    businessType,
    registrationNumber
  });

  if (seller) {
    res.status(201).json({
      _id: seller._id,
      businessName: seller.businessName,
      email: seller.email,
      token: generateToken(seller._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid seller data');
  }
});

// @desc    Auth seller & get token
// @route   POST /api/seller/login
// @access  Public
const loginSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const seller = await Seller.findOne({ email });

  if (seller && (await bcrypt.compare(password, seller.password))) {
    res.json({
      _id: seller._id,
      businessName: seller.businessName,
      email: seller.email,
      token: generateToken(seller._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get seller profile
// @route   GET /api/seller/profile
// @access  Private
const getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await Seller.findById(req.seller._id);

  if (seller) {
    res.json({
      _id: seller._id,
      businessName: seller.businessName,
      ownerName: seller.ownerName,
      email: seller.email,
      phone: seller.phone,
      address: seller.address,
      businessType: seller.businessType,
      verificationStatus: seller.verificationStatus,
      ratings: seller.ratings,
    });
  } else {
    res.status(404);
    throw new Error('Seller not found');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export {
  registerSeller,
  loginSeller,
  getSellerProfile,
};