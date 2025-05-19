const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const samplePayments = [
  {
    transactionId: "TXN123456789",
    orderId: "67db3fa31dd08348b210c0f5", // Using existing order ID
    customerName: "Ananya Desai",
    amount: 370,
    paymentMethod: "UPI",
    status: "completed",
    paymentDate: new Date("2023-07-01"),
    gatewayResponse: { 
      success: true, 
      code: "PAYMENT_SUCCESS",
      message: "Payment processed successfully"
    }
  },
  {
    transactionId: "TXN123456790",
    orderId: "67db3fa31dd08348b210c0f6",
    customerName: "Karthik Rajan",
    amount: 320,
    paymentMethod: "Credit Card",
    status: "pending",
    paymentDate: new Date("2023-07-10"),
    gatewayResponse: { 
      success: false, 
      code: "PAYMENT_PROCESSING",
      message: "Payment is being processed"
    }
  },
  {
    transactionId: "TXN123456791",
    orderId: "67db3fa31dd08348b210c0f7",
    customerName: "Meera Joshi",
    amount: 340,
    paymentMethod: "Cash on Delivery",
    status: "completed",
    paymentDate: new Date("2023-07-05"),
    gatewayResponse: { 
      success: true, 
      code: "COD_CONFIRMED",
      message: "Cash on delivery confirmed"
    }
  },
  {
    transactionId: "TXN123456792",
    orderId: "67db3fa31dd08348b210c0f8",
    customerName: "Arjun Nair",
    amount: 480,
    paymentMethod: "UPI",
    status: "failed",
    paymentDate: new Date("2023-07-08"),
    gatewayResponse: { 
      success: false, 
      code: "PAYMENT_FAILED",
      message: "Transaction failed due to insufficient funds"
    }
  },
  {
    transactionId: "TXN123456793",
    orderId: "67db3fa31dd08348b210c0f9",
    customerName: "Lakshmi Krishnan",
    amount: 290,
    paymentMethod: "Debit Card",
    status: "completed",
    paymentDate: new Date("2023-07-03"),
    gatewayResponse: { 
      success: true, 
      code: "PAYMENT_SUCCESS",
      message: "Payment processed successfully"
    }
  }
];

const seedPayments = async () => {
  try {
    // Clear existing payments
    await Payment.deleteMany({});
    
    // Insert sample payments
    const insertedPayments = await Payment.insertMany(samplePayments);
    
    console.log('Successfully seeded payments:', insertedPayments.length);
  } catch (error) {
    console.error('Error seeding payments:', error);
  }
};

module.exports = seedPayments; 