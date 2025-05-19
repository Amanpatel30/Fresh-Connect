require('dotenv').config();
const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for testing complaint data'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to run all tests
const runTests = async () => {
  try {
    console.log('\n----- TESTING COMPLAINT COLLECTION -----\n');
    
    // Test 1: Count all complaints
    const totalCount = await Complaint.countDocuments();
    console.log(`Total complaints in database: ${totalCount}`);
    
    // Test 2: Get complaints by status
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    
    console.log('\nComplaints by status:');
    console.log(`- Pending: ${pendingComplaints}`);
    console.log(`- In Progress: ${inProgressComplaints}`);
    console.log(`- Resolved: ${resolvedComplaints}`);
    
    // Test 3: Get complaints by priority
    const urgentComplaints = await Complaint.countDocuments({ priority: 'urgent' });
    const highComplaints = await Complaint.countDocuments({ priority: 'high' });
    const mediumComplaints = await Complaint.countDocuments({ priority: 'medium' });
    const lowComplaints = await Complaint.countDocuments({ priority: 'low' });
    
    console.log('\nComplaints by priority:');
    console.log(`- Urgent: ${urgentComplaints}`);
    console.log(`- High: ${highComplaints}`);
    console.log(`- Medium: ${mediumComplaints}`);
    console.log(`- Low: ${lowComplaints}`);
    
    // Test 4: Get the most recent complaints
    const recentComplaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('\nMost recent complaints:');
    recentComplaints.forEach((complaint, index) => {
      console.log(`\n${index + 1}. ${complaint.subject}`);
      console.log(`   Customer: ${complaint.customerName}`);
      console.log(`   Status: ${complaint.status}`);
      console.log(`   Priority: ${complaint.priority}`);
      console.log(`   Created: ${complaint.createdAt.toLocaleDateString()}`);
    });
    
    // Test 5: Find a specific complaint by email
    const specificEmail = 'john.doe@example.com';
    const specificComplaint = await Complaint.findOne({ email: specificEmail });
    
    console.log(`\nFinding complaint for email: ${specificEmail}`);
    if (specificComplaint) {
      console.log(`Found: ${specificComplaint.subject}`);
      console.log(`Description: ${specificComplaint.description}`);
    } else {
      console.log(`No complaint found for email: ${specificEmail}`);
    }
    
    console.log('\n----- ALL TESTS COMPLETED -----\n');
    
    // Disconnect from database
    mongoose.disconnect();
    console.log('MongoDB disconnected');
    
  } catch (error) {
    console.error('Error testing complaint data:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the tests
runTests(); 