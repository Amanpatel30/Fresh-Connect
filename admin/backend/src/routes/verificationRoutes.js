const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Verification = require('../models/Verification');
const Order = require('../models/Order');

// Get recent verifications
router.get('/', async (req, res) => {
  try {
    // Get recent seller verifications
    const sellerVerifications = await User.find({
      role: 'seller',
      isVerified: true
    })
    .select('name role isVerified verifiedAt')
    .sort({ verifiedAt: -1 })
    .limit(5);

    // Get recent hotel verifications
    const hotelVerifications = await Hotel.find({
      isVerified: true
    })
    .select('name isVerified verifiedAt')
    .sort({ verifiedAt: -1 })
    .limit(5);

    // Combine and format verifications
    const verifications = [
      ...sellerVerifications.map(v => ({
        id: v._id,
        name: v.name,
        type: 'Seller',
        status: 'Verified',
        date: v.verifiedAt
      })),
      ...hotelVerifications.map(v => ({
        id: v._id,
        name: v.name,
        type: 'Hotel',
        status: 'Verified',
        date: v.verifiedAt
      }))
    ].sort((a, b) => b.date - a.date);

    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all verifications
router.get('/all', async (req, res) => {
  try {
    const verifications = await Verification.find()
      .populate('userId', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });
    res.json(verifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get verification status for orders
router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('sellerId')
      .populate('hotelId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const verificationData = {
      orderId: order._id,
      sellerVerification: null,
      hotelVerification: null
    };

    // Get seller verification if order has a seller
    if (order.sellerId) {
      const sellerVerification = await Verification.findOne({
        userId: order.sellerId._id,
        type: 'seller'
      });
      verificationData.sellerVerification = sellerVerification;
    }

    // Get hotel verification if order has a hotel
    if (order.hotelId) {
      const hotelVerification = await Verification.findOne({
        userId: order.hotelId._id,
        type: 'hotel'
      });
      verificationData.hotelVerification = hotelVerification;
    }

    res.json(verificationData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 