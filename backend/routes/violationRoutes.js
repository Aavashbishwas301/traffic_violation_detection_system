import express from 'express';
import {
  uploadViolation,
  getViolations,
  getMyViolations,
  updateViolation,
  deleteViolation,
} from '../controllers/violationController.js';
import { protect, police } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, police, upload.single('evidence'), uploadViolation);
router.get('/', protect, police, getViolations);
router.get('/my', protect, getMyViolations);

// New Police management routes
router.put('/:id', protect, police, updateViolation);
router.delete('/:id', protect, police, deleteViolation);

export default router;
