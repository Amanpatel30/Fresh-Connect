const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel
} = require('../controllers/hotelController');

// Get all hotels and create hotel
router.route('/')
  .get(getHotels)
  .post(createHotel);

// Get, update and delete hotel by ID
router.route('/:id')
  .get(getHotelById)
  .put(updateHotel)
  .delete(deleteHotel);

module.exports = router; 