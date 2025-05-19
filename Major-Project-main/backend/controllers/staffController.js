import asyncHandler from 'express-async-handler';
import Staff from '../models/Staff.js';

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private (Hotel Owner)
const getAllStaff = asyncHandler(async (req, res) => {
  const hotelId = req.hotel._id; // Assuming hotel ID is added to req by auth middleware
  
  const staffMembers = await Staff.find({ hotel: hotelId });
  
  res.json(staffMembers);
});

// @desc    Get a single staff member
// @route   GET /api/staff/:id
// @access  Private (Hotel Owner)
const getStaffById = asyncHandler(async (req, res) => {
  const hotelId = req.hotel._id;
  
  const staff = await Staff.findOne({ 
    _id: req.params.id,
    hotel: hotelId
  });
  
  if (staff) {
    res.json(staff);
  } else {
    res.status(404);
    throw new Error('Staff member not found');
  }
});

// @desc    Create a staff member
// @route   POST /api/staff
// @access  Private (Hotel Owner)
const createStaff = asyncHandler(async (req, res) => {
  const hotelId = req.hotel._id;
  
  const {
    name,
    role,
    department,
    phone,
    email,
    address,
    dateHired,
    status,
  } = req.body;
  
  // Check if staff with this email already exists
  const staffExists = await Staff.findOne({ email });
  
  if (staffExists) {
    res.status(400);
    throw new Error('Staff member with this email already exists');
  }
  
  const staff = await Staff.create({
    hotel: hotelId,
    name,
    role,
    department,
    phone,
    email,
    address,
    dateHired: dateHired || Date.now(),
    status: status || 'Active',
  });
  
  if (staff) {
    res.status(201).json(staff);
  } else {
    res.status(400);
    throw new Error('Invalid staff data');
  }
});

// @desc    Update a staff member
// @route   PUT /api/staff/:id
// @access  Private (Hotel Owner)
const updateStaff = asyncHandler(async (req, res) => {
  const hotelId = req.hotel._id;
  
  const staff = await Staff.findOne({
    _id: req.params.id,
    hotel: hotelId
  });
  
  if (staff) {
    staff.name = req.body.name || staff.name;
    staff.role = req.body.role || staff.role;
    staff.department = req.body.department || staff.department;
    staff.phone = req.body.phone || staff.phone;
    staff.email = req.body.email || staff.email;
    staff.address = req.body.address || staff.address;
    staff.emergencyContact = req.body.emergencyContact || staff.emergencyContact;
    staff.dateOfBirth = req.body.dateOfBirth || staff.dateOfBirth;
    staff.status = req.body.status || staff.status;
    staff.salary = req.body.salary || staff.salary;
    staff.leaveBalance = req.body.leaveBalance || staff.leaveBalance;
    staff.performance = req.body.performance || staff.performance;
    staff.schedule = req.body.schedule || staff.schedule;
    
    // If documents are provided, add them to the existing array
    if (req.body.documents && req.body.documents.length > 0) {
      staff.documents = [...staff.documents, ...req.body.documents];
    }
    
    const updatedStaff = await staff.save();
    res.json(updatedStaff);
  } else {
    res.status(404);
    throw new Error('Staff member not found');
  }
});

// @desc    Delete a staff member
// @route   DELETE /api/staff/:id
// @access  Private (Hotel Owner)
const deleteStaff = asyncHandler(async (req, res) => {
  const hotelId = req.hotel._id;
  
  const staff = await Staff.findOne({
    _id: req.params.id,
    hotel: hotelId
  });
  
  if (staff) {
    await staff.remove();
    res.json({ message: 'Staff member removed' });
  } else {
    res.status(404);
    throw new Error('Staff member not found');
  }
});

// @desc    Get staff statistics
// @route   GET /api/staff/stats
// @access  Private (Hotel Owner)
const getStaffStats = asyncHandler(async (req, res) => {
  const hotelId = req.hotel._id;
  
  // Get count by department
  const departmentStats = await Staff.aggregate([
    { $match: { hotel: hotelId } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get count by status
  const statusStats = await Staff.aggregate([
    { $match: { hotel: hotelId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  
  // Get total count
  const totalCount = await Staff.countDocuments({ hotel: hotelId });
  
  // Get recent hires (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentHires = await Staff.countDocuments({
    hotel: hotelId,
    dateHired: { $gte: thirtyDaysAgo }
  });
  
  res.json({
    totalCount,
    departmentStats,
    statusStats,
    recentHires
  });
});

export {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats
}; 