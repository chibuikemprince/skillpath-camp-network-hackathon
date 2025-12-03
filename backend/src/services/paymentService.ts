import { createPublicClient, http } from 'viem';
import { CertificatePayment } from '../types/payment';

// In-memory storage for demo - replace with real database
const payments: CertificatePayment[] = [];

class PaymentService {
  private publicClient;
  private merchantAddress: string;
  private certPriceWei: bigint;

  constructor() {
    this.publicClient = createPublicClient({
      transport: http(process.env.RPC_URL || 'https://rpc.camp.network')
    });
    this.merchantAddress = process.env.MERCHANT_ADDRESS || '';
    this.certPriceWei = BigInt(process.env.CERT_PRICE_WEI || '50000000000000000'); // 0.05 CAMP
  }

  async confirmPayment(txHash: string, curriculumId: string, userAddress?: string): Promise<{ success: boolean; reason?: string }> {
    try {
      if (!this.merchantAddress) {
        return { success: false, reason: 'Merchant address not configured' };
      }

      // Get transaction details
      const tx = await this.publicClient.getTransaction({ hash: txHash as `0x${string}` });
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

      // Verify transaction
      if (receipt.status !== 'success') {
        return { success: false, reason: 'Transaction failed' };
      }

      if (tx.to?.toLowerCase() !== this.merchantAddress.toLowerCase()) {
        return { success: false, reason: 'Invalid recipient address' };
      }

      if (tx.value < this.certPriceWei) {
        return { success: false, reason: 'Insufficient payment amount' };
      }

      if (tx.value !== this.certPriceWei) {
        return { success: false, reason: 'Payment amount does not match required price' };
      }

      const fromAddress = userAddress || tx.from;

      // Check if payment already exists
      const existingPayment = payments.find(p => 
        p.txHash === txHash || 
        (p.userAddress === fromAddress && p.curriculumId === curriculumId)
      );

      if (!existingPayment) {
        // Create new payment record
        const payment: CertificatePayment = {
          id: Date.now().toString(),
          userAddress: fromAddress,
          curriculumId,
          txHash,
          paid: true,
          createdAt: new Date()
        };
        payments.push(payment);
      }

      return { success: true };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return { success: false, reason: 'Failed to verify transaction' };
    }
  }

  async checkEligibility(userAddress: string, curriculumId: string): Promise<{ eligible: boolean; hasPaid: boolean; reason?: string; certificateInfo?: any }> {
    const payment = payments.find(p => 
      p.userAddress.toLowerCase() === userAddress.toLowerCase() && 
      p.curriculumId === curriculumId && 
      p.paid
    );

    const certificateInfo = payment ? {
      curriculumId,
      userAddress,
      paymentTxHash: payment.txHash,
      paidAt: payment.createdAt,
      canMint: true
    } : null;

    return {
      eligible: !!payment,
      hasPaid: !!payment,
      reason: payment ? undefined : 'Payment not found or not confirmed',
      certificateInfo
    };
  }

  getCertificatePrice(): { priceWei: string; priceEth: string; merchantAddress: string } {
    const priceEth = (Number(this.certPriceWei) / 1e18).toString();
    return {
      priceWei: this.certPriceWei.toString(),
      priceEth,
      merchantAddress: this.merchantAddress
    };
  }
}

export default new PaymentService();
