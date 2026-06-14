import express from 'express';
import { 
    initiateKhalti, 
    verifyKhalti, 
    initiateEsewa, 
    verifyEsewa,
    payFine
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/khalti/initiate', protect, initiateKhalti);
router.post('/khalti/verify', protect, verifyKhalti);
router.post('/esewa/initiate', protect, initiateEsewa);
router.get('/esewa/verify', verifyEsewa); 
router.post('/:id/pay', protect, payFine);

export default router;
