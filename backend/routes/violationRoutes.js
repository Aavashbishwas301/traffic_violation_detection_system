import express from 'express';
import {
  uploadViolation,
  manualViolation,
  getViolations,
  getMyViolations,
  updateViolation,
  deleteViolation,
  getPoliceStats,
  getViolationEvidence
} from '../controllers/violationController.js';
import { protect, police } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

import { manualViolationValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/upload', protect, police, upload.single('evidence'), uploadViolation);
router.post('/manual', protect, police, upload.single('evidence'), manualViolationValidation, manualViolation);
router.get('/', protect, police, getViolations);
router.get('/my', protect, getMyViolations);

// Evidence Retrieval and Streaming Route (Owner / Police / Admin)
router.get('/:id/evidence', protect, getViolationEvidence);

// Police management routes
router.get('/police/stats', protect, police, getPoliceStats);
router.put('/:id', protect, police, updateViolation);
router.delete('/:id', protect, police, deleteViolation);

export default router;
