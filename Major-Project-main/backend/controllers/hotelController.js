import asyncHandler from 'express-async-handler';
import Hotel from '../models/Hotel.js';
import MenuItem from '../models/MenuItem.js';
import Inventory from '../models/Inventory.js';
import Task from '../models/Task.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    Auth hotel & get token
// @route   POST /api/hotels/login
// @access  Public
const authHotel = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const hotel = await Hotel.findOne({ email });

  if (hotel && (await hotel.matchPassword(password))) {
    res.json({
      _id: hotel._id,
      name: hotel.name,
      email: hotel.email,
      address: hotel.address,
      phone: hotel.phone,
      isVerified: hotel.isVerified,
      logo: hotel.logo,
      isHotel: true,
      role: 'hotel',
      hotelId: hotel._id,
      token: generateToken(hotel._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new hotel
// @route   POST /api/hotels
// @access  Public
const registerHotel = asyncHandler(async (req, res) => {
  const { name, email, password, address, phone, role, ownerName } = req.body;

  const hotelExists = await Hotel.findOne({ email });

  if (hotelExists) {
    res.status(400);
    throw new Error('Hotel already exists');
  }

  const hotel = await Hotel.create({
    name,
    email,
    password,
    address,
    phone,
    ownerName: ownerName || name,
  });

  if (hotel) {
    res.status(201).json({
      _id: hotel._id,
      name: hotel.name,
      email: hotel.email,
      address: hotel.address,
      phone: hotel.phone,
      isVerified: hotel.isVerified,
      logo: hotel.logo,
      isHotel: true,
      role: 'hotel',
      hotelId: hotel._id,
      token: generateToken(hotel._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid hotel data');
  }
});

// @desc    Get hotel profile
// @route   GET /api/hotels/profile
// @access  Private
const getHotelProfile = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.hotel._id);

  if (hotel) {
    res.json({
      _id: hotel._id,
      name: hotel.name,
      email: hotel.email,
      address: hotel.address,
      phone: hotel.phone,
      description: hotel.description,
      logo: hotel.logo,
      coverImage: hotel.coverImage,
      isVerified: hotel.isVerified,
      verificationDocuments: hotel.verificationDocuments,
      rating: hotel.rating,
      numReviews: hotel.numReviews,
      reviews: hotel.reviews,
    });
  } else {
    res.status(404);
    throw new Error('Hotel not found');
  }
});

// @desc    Update hotel profile
// @route   PUT /api/hotels/profile
// @access  Private
const updateHotelProfile = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.hotel._id);

  if (hotel) {
    hotel.name = req.body.name || hotel.name;
    hotel.email = req.body.email || hotel.email;
    hotel.address = req.body.address || hotel.address;
    hotel.phone = req.body.phone || hotel.phone;
    hotel.description = req.body.description || hotel.description;
    hotel.logo = req.body.logo || hotel.logo;
    hotel.coverImage = req.body.coverImage || hotel.coverImage;

    if (req.body.password) {
      hotel.password = req.body.password;
    }

    const updatedHotel = await hotel.save();

    res.json({
      _id: updatedHotel._id,
      name: updatedHotel.name,
      email: updatedHotel.email,
      address: updatedHotel.address,
      phone: updatedHotel.phone,
      description: updatedHotel.description,
      logo: updatedHotel.logo,
      coverImage: updatedHotel.coverImage,
      isVerified: updatedHotel.isVerified,
      token: generateToken(updatedHotel._id),
    });
  } else {
    res.status(404);
    throw new Error('Hotel not found');
  }
});

// @desc    Get hotel dashboard data
// @route   GET /api/hotels/dashboard
// @access  Private
const getHotelDashboard = asyncHandler(async (req, res) => {
  // Get inventory alerts
  const inventoryAlerts = await Inventory.find({
    hotel: req.hotel._id,
    $or: [{ isLowStock: true }, { isOutOfStock: true }],
  }).limit(5);

  // Get upcoming tasks
  const upcomingTasks = await Task.find({
    hotel: req.hotel._id,
    status: { $ne: 'Completed' },
    dueDate: { $gte: new Date() },
  })
    .sort({ dueDate: 1 })
    .limit(5);

  // Get recent menu items
  const recentMenuItems = await MenuItem.find({ hotel: req.hotel._id })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    inventoryAlerts,
    upcomingTasks,
    recentMenuItems,
  });
});

// @desc    Upload verification documents
// @route   POST /api/hotels/verification
// @access  Private
const uploadVerificationDocuments = asyncHandler(async (req, res) => {
  const { name, url } = req.body;

  const hotel = await Hotel.findById(req.hotel._id);

  if (hotel) {
    const document = {
      name,
      url,
      status: 'pending',
    };

    hotel.verificationDocuments.push(document);
    await hotel.save();

    res.status(201).json({ message: 'Document uploaded successfully' });
  } else {
    res.status(404);
    throw new Error('Hotel not found');
  }
});

// @desc    Check if hotel email exists
// @route   POST /api/hotels/check-email
// @access  Public
const checkHotelEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const hotel = await Hotel.findOne({ email });
  
  res.json({
    exists: !!hotel
  });
});

// @desc    Get all verified hotels
// @route   GET /api/hotels
// @access  Public
const getVerifiedHotels = asyncHandler(async (req, res) => {
  const isVerified = req.query.isVerified === 'true';
  
  // If isVerified query param is true, filter by verified hotels only
  const filter = isVerified ? { isVerified: true } : {};
  
  const hotels = await Hotel.find(filter)
    .select('-password') // Exclude password field
    .sort({ name: 1 }); // Sort by name
  
  res.json(hotels);
});

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = asyncHandler(async (req, res) => {
  const hotelId = req.params.id;
  
  const hotel = await Hotel.findById(hotelId)
    .select('-password -verificationDocuments'); // Exclude sensitive fields
  
  if (hotel) {
    res.json(hotel);
  } else {
    res.status(404);
    throw new Error('Hotel not found');
  }
});

export {
  authHotel,
  registerHotel,
  getHotelProfile,
  updateHotelProfile,
  getHotelDashboard,
  uploadVerificationDocuments,
  checkHotelEmail,
  getVerifiedHotels,
  getHotelById
}; 