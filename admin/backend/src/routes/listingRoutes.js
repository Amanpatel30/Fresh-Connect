const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// Get urgent listings
router.get('/urgent', async (req, res) => {
  try {
    const urgentListings = await Listing.find({ isUrgent: true })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(urgentListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get free listings
router.get('/free', async (req, res) => {
  try {
    const freeListings = await Listing.find({ isFree: true })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(freeListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 