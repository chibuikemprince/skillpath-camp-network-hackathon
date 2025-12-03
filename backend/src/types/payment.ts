export interface CertificatePayment {
  id: string;
  userAddress: string;
  curriculumId: string;
  txHash: string;
  paid: boolean;
  createdAt: Date;
}

export interface PaymentConfirmRequest {
  txHash: string;
  curriculumId: string;
  userAddress?: string;
}

export interface EligibilityResponse {
  eligible: boolean;
  reason?: string;
}