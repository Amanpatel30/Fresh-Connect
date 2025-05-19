require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for querying complaint data'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// MongoDB query to find all complaints
const queryComplaints = async () => {
  try {
    console.log('\n----- QUERYING COMPLAINTS IN MONGODB -----\n');
    
    // Find all complaints
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    
    console.log(`Found ${complaints.length} complaints in the database`);
    
    if (complaints.length > 0) {
      complaints.forEach((complaint, index) => {
        console.log(`\n${index + 1}. ${complaint.subject}`);
        console.log(`  Customer: ${complaint.customerName} (${complaint.email})`);
        console.log(`  Status: ${complaint.status}`);
        console.log(`  Priority: ${complaint.priority}`);
        console.log(`  Created: ${complaint.createdAt.toLocaleString()}`);
        console.log(`  Description: ${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}`);
      });
    }
    
    // Count by status
    const pendingCount = await Complaint.countDocuments({ status: 'pending' });
    const inProgressCount = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedCount = await Complaint.countDocuments({ status: 'resolved' });
    
    console.log('\nComplaints by Status:');
    console.log(`  Pending: ${pendingCount}`);
    console.log(`  In Progress: ${inProgressCount}`);
    console.log(`  Resolved: ${resolvedCount}`);
    
    console.log('\n----- QUERY COMPLETED -----\n');
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Error querying complaints:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Execute the query
queryComplaints(); 