import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getCertificateEligibility, 
  confirmPayment, 
  requestMint, 
  recordMint 
} from '../controllers/certificateController';

const router = express.Router();

// All certificate routes require authentication
router.use(authenticateToken);

// Get certificate eligibility for a curriculum
router.get('/eligibility', getCertificateEligibility);

// Confirm payment for certificate
router.post('/payment-confirmed', confirmPayment);

// Request mint metadata
router.post('/request-mint', requestMint);

// Record successful mint
router.post('/minted', recordMint);

export default router;