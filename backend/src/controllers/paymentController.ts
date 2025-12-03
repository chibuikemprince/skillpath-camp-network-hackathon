import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import paymentService from '../services/paymentService';
import { PaymentConfirmRequest } from '../types/payment';

export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { txHash, curriculumId, userAddress }: PaymentConfirmRequest = req.body;

    if (!txHash || !curriculumId) {
      res.status(400).json({ error: 'Missing required fields: txHash, curriculumId' });
      return;
    }

    const result = await paymentService.confirmPayment(txHash, curriculumId, userAddress);

    if (result.success) {
      res.json({ success: true, message: 'Payment confirmed' });
    } else {
      res.status(400).json({ success: false, reason: result.reason });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

export const checkEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { curriculumId } = req.query;
    const userAddress = req.headers['x-user-address'] as string; // Can be from JWT or header

    if (!curriculumId || !userAddress) {
      res.status(400).json({ error: 'Missing curriculumId or user address' });
      return;
    }

    const result = await paymentService.checkEligibility(userAddress, curriculumId as string);
    res.json(result);
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
};

export const getCertificatePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const price = paymentService.getCertificatePrice();
    res.json(price);
  } catch (error) {
    console.error('Get certificate price error:', error);
    res.status(500).json({ error: 'Failed to get certificate price' });
  }
};