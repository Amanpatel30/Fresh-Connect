const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getAllUsers,
  updateUserRole,
  getPendingSellerVerifications,
  verifySeller,
  getPendingHotels,
  verifyHotel,
  getCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  getOrderStatuses,
  getAllPayments,
  getSalesReport,
  getContent,
  getAnalytics,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getSystemSettings,
  updateSystemSettings,
  getPublicSettings
} = require('../controllers/adminController');

// Dashboard
router.get('/dashboard', getDashboardData);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// Seller Verification
router.get('/sellers/pending', getPendingSellerVerifications);
router.put('/sellers/:id/verify', verifySeller);

// Hotel Verification
router.get('/hotels/pending', getPendingHotels);
router.put('/hotels/:id/verify', verifyHotel);

// Product Category Management
router.route('/categories')
  .get(getCategories)
  .post(addCategory);

router.route('/categories/:id')
  .get(getCategoryById)
  .put(updateCategory)
  .delete(deleteCategory);

// Order Monitoring
router.get('/orders', getAllOrders);
router.get('/orders/status', getOrderStatuses);

// Payment Management
router.get('/payments', getAllPayments);

// Report Generation
router.get('/reports/sales', getSalesReport);

// Content Management
router.get('/content', getContent);

// Analytics
router.get('/analytics', getAnalytics);

// Complaint Handling
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getComplaintById);
router.put('/complaints/:id', updateComplaintStatus);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);
router.get('/settings/public', getPublicSettings);

module.exports = router; 