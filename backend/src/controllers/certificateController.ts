import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import certificateService from '../services/certificateService';

export const getCertificateEligibility = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { curriculumId } = req.query;

    if (!curriculumId) {
      res.status(400).json({ error: 'curriculumId is required' });
      return;
    }

    const eligibility = await certificateService.getCertificateEligibility(userId, curriculumId as string);
    res.json(eligibility);
  } catch (error) {
    console.error('Get certificate eligibility error:', error);
    res.status(500).json({ error: 'Failed to check certificate eligibility' });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { curriculumId, walletAddress, paymentTxHash } = req.body;

    if (!curriculumId || !walletAddress || !paymentTxHash) {
      res.status(400).json({ error: 'curriculumId, walletAddress, and paymentTxHash are required' });
      return;
    }

    const success = await certificateService.recordPayment(userId, curriculumId, walletAddress, paymentTxHash);
    
    if (!success) {
      res.status(400).json({ error: 'User not eligible for certificate or payment already recorded' });
      return;
    }

    res.json({ message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

export const requestMint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { curriculumId, walletAddress } = req.body;

    if (!curriculumId || !walletAddress) {
      res.status(400).json({ error: 'curriculumId and walletAddress are required' });
      return;
    }

    const metadata = await certificateService.generateCertificateMetadata(userId, curriculumId);
    
    if (!metadata) {
      res.json({ 
        canMint: false, 
        reason: 'Not eligible or payment not confirmed' 
      });
      return;
    }

    res.json({ 
      canMint: true, 
      metadata 
    });
  } catch (error) {
    console.error('Request mint error:', error);
    res.status(500).json({ error: 'Failed to generate certificate metadata' });
  }
};

export const recordMint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { curriculumId, walletAddress, tokenId, mintTxHash } = req.body;

    if (!curriculumId || !walletAddress || !tokenId || !mintTxHash) {
      res.status(400).json({ error: 'curriculumId, walletAddress, tokenId, and mintTxHash are required' });
      return;
    }

    const success = await certificateService.recordMint(userId, curriculumId, walletAddress, tokenId, mintTxHash);
    
    if (!success) {
      res.status(400).json({ error: 'Cannot record mint - not eligible or not paid' });
      return;
    }

    res.json({ message: 'Certificate mint recorded successfully' });
  } catch (error) {
    console.error('Record mint error:', error);
    res.status(500).json({ error: 'Failed to record certificate mint' });
  }
};