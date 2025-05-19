const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');

// Sample complaint data
const complaintData = [
  {
    customerName: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'Delayed Delivery',
    description: 'My order #12345 was supposed to be delivered on Monday but still has not arrived.',
    status: 'pending',
    priority: 'high',
    createdAt: new Date('2023-06-15')
  },
  {
    customerName: 'Alice Smith',
    email: 'alice.smith@example.com',
    subject: 'Damaged Product',
    description: 'The package arrived but the product inside was damaged. Order #54321.',
    status: 'in-progress',
    priority: 'medium',
    createdAt: new Date('2023-06-10')
  },
  {
    customerName: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    subject: 'Wrong Item Received',
    description: 'I ordered a blue shirt but received a red one. Order #98765.',
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date('2023-06-05'),
    resolvedAt: new Date('2023-06-08')
  },
  {
    customerName: 'Emma Wilson',
    email: 'emma.wilson@example.com',
    subject: 'Refund Not Processed',
    description: 'I returned an item two weeks ago but have not received my refund yet.',
    status: 'pending',
    priority: 'urgent',
    createdAt: new Date('2023-06-12')
  },
  {
    customerName: 'Michael Brown',
    email: 'michael.brown@example.com',
    subject: 'Account Access Issue',
    description: 'I cannot log into my account despite resetting my password multiple times.',
    status: 'in-progress',
    priority: 'low',
    createdAt: new Date('2023-06-13')
  }
];

// Seed data function
const seedComplaintData = async () => {
  try {    
    // Clear existing data
    console.log('Clearing existing complaint data...');
    await Complaint.deleteMany({});
    
    // Insert new complaints
    console.log('Seeding complaint data...');
    await Complaint.insertMany(complaintData);
    console.log(`${complaintData.length} complaints added to the database`);
    
  } catch (error) {
    console.error('Error seeding complaint data:', error);
  }
};

module.exports = seedComplaintData; 