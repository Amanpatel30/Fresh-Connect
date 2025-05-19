const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Get all complaints
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/complaints called');
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    console.log(`Found ${complaints.length} complaints`);
    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get complaints statistics
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('GET /api/complaints/stats/summary called');
    
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    
    const stats = {
      total: totalComplaints,
      pending: pendingComplaints,
      inProgress: inProgressComplaints,
      resolved: resolvedComplaints
    };
    
    console.log('Returning complaint stats:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get complaint by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`GET /api/complaints/${req.params.id} called`);
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) {
      console.log('Complaint not found');
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    console.log('Returning complaint:', complaint);
    res.json(complaint);
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create new complaint
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/complaints called');
    console.log('Request body:', req.body);
    
    const { customerName, email, subject, description, priority } = req.body;
    
    // Validate required fields
    if (!customerName || !email || !subject || !description) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }
    
    const newComplaint = new Complaint({
      customerName,
      email,
      subject,
      description,
      priority: priority || 'medium'
    });
    
    const savedComplaint = await newComplaint.save();
    console.log('New complaint created:', savedComplaint);
    res.status(201).json(savedComplaint);
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update complaint status
router.put('/:id/status', async (req, res) => {
  try {
    console.log(`PUT /api/complaints/${req.params.id}/status called`);
    const { status } = req.body;
    
    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updateData = { status };
    
    // If status is resolved, add resolvedAt date
    if (status === 'resolved') {
      updateData.resolvedAt = Date.now();
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!complaint) {
      console.log('Complaint not found');
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    console.log('Complaint status updated:', complaint);
    res.json(complaint);
  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete complaint
router.delete('/:id', async (req, res) => {
  try {
    console.log(`DELETE /api/complaints/${req.params.id} called`);
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    
    if (!complaint) {
      console.log('Complaint not found');
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    console.log('Complaint deleted:', req.params.id);
    res.json({ message: 'Complaint removed' });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router; 