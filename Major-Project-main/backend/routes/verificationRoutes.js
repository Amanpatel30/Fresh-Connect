import express from 'express';
import {
  getVerificationStatus,
  getVerificationDocuments,
  applyForVerification,
  uploadDocument,
  deleteDocument,
  cancelVerification,
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Hotel owner routes
router.get('/status', protect, getVerificationStatus);
router.get('/documents', protect, getVerificationDocuments);
router.post('/apply', protect, applyForVerification);
router.post('/document', protect, uploadDocument);
router.delete('/document/:id', protect, deleteDocument);
router.delete('/cancel', protect, cancelVerification);

// Admin routes removed

export default router; 