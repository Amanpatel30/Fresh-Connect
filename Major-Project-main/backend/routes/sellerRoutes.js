import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import * as productController from '../controllers/sellerProductController.js';
import * as orderController from '../controllers/orderController.js';
import { getSellerUrgentSales, getUrgentSaleById as getUrgentSale, createUrgentSale, updateUrgentSale, deleteUrgentSale } from '../controllers/urgentSaleController.js';
import * as profileController from '../controllers/profileController.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(restrictTo('seller'));

// Product routes
router
  .route('/products')
  .get(productController.getProducts)
  .post(productController.createProduct);

// Specific product routes must come before parameterized routes
router.get('/products/stats', productController.getProductStats);
router.get('/products/featured', productController.getFeaturedProducts);
router.patch('/products/bulk-update', productController.bulkUpdateProducts);

// Parameterized routes come last
router
  .route('/products/:id')
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

router.patch('/products/:id/featured', productController.toggleFeaturedStatus);

// Profile routes
router.get('/profile', profileController.getSellerProfile);
router.put('/profile', profileController.updateSellerProfile);
router.post('/profile/upload-image', profileController.uploadProfileImage);
router.put('/profile/documents', profileController.updateBusinessDocuments);
router.post('/profile/upload-document', profileController.uploadDocumentFile);
router.post('/profile/change-password', profileController.changePassword);

// Order routes
router.get('/orders', orderController.getOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', orderController.getOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

// Dashboard routes
router.get('/dashboard', dashboardController.getSellerDashboard);
router.get('/sales/stats', dashboardController.getSalesData);

// Urgent sale routes
router
  .route('/urgent-sales')
  .get(getSellerUrgentSales)
  .post(createUrgentSale);

router
  .route('/urgent-sales/:id')
  .get(getUrgentSale)
  .patch(updateUrgentSale)
  .delete(deleteUrgentSale);

export default router; 
