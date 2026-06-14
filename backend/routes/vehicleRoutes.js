import express from 'express';
import { getVehicleByNumber, getMyVehicles } from '../controllers/vehicleController.js';
import { protect, police } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyVehicles);
router.get('/:number', protect, police, getVehicleByNumber);

export default router;
