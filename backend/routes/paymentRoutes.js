import express from 'express';
import { 
    initiateKhalti, 
    verifyKhalti, 
    initiateEsewa, 
    verifyEsewa,
    payFine
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
    khaltiInitiateValidation, 
    khaltiVerifyValidation, 
    esewaInitiateValidation 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/khalti/initiate', protect, khaltiInitiateValidation, initiateKhalti);
router.post('/khalti/verify', protect, khaltiVerifyValidation, verifyKhalti);
router.post('/esewa/initiate', protect, esewaInitiateValidation, initiateEsewa);
router.get('/esewa/verify', verifyEsewa); 
router.post('/:id/pay', protect, payFine);

export default router;
