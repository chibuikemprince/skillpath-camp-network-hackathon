import express from 'express';
import { confirmPayment, checkEligibility, getCertificatePrice } from '../controllers/paymentController';

const router = express.Router();

// Get certificate price
router.get('/price', getCertificatePrice);

// Confirm payment transaction
router.post('/confirm', confirmPayment);

// Check certificate eligibility
router.get('/eligibility', checkEligibility);

export default router;