import asyncHandler from 'express-async-handler';
import Business from '../models/businessModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    Register a new business
// @route   POST /api/business/register
// @access  Public
const registerBusiness = asyncHandler(async (req, res) => {
  const {
    businessType,
    businessName,
    ownerName,
    email,
    phone,
    password,
    address,
    registrationNumber
  } = req.body;

  const businessExists = await Business.findOne({ email });

  if (businessExists) {
    res.status(400);
    throw new Error('Business already exists');
  }

  // Handle file upload
  let businessLicenseUrl = '';
  if (req.file) {
    businessLicenseUrl = req.file.path;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const business = await Business.create({
    businessType,
    businessName,
    ownerName,
    email,
    phone,
    password: hashedPassword,
    address,
    businessLicense: businessLicenseUrl,
    registrationNumber,
    // Add type-specific fields based on businessType
    ...(businessType === 'hotel' ? {
      hotelType: req.body.hotelType,
      cuisine: req.body.cuisine,
      seatingCapacity: req.body.seatingCapacity
    } : {
      productCategories: req.body.productCategories,
      storageType: req.body.storageType,
      deliveryRadius: req.body.deliveryRadius
    })
  });

  if (business) {
    res.status(201).json({
      _id: business._id,
      businessName: business.businessName,
      email: business.email,
      businessType: business.businessType,
      token: generateToken(business._id)
    });
  } else {
    res.status(400);
    throw new Error('Invalid business data');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

export {
  registerBusiness
};