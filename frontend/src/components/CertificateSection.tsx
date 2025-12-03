import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { useOriginAuth } from '../hooks/useOriginAuth';
import { certificatesAPI } from '../services/api';
import PayForCertificateButton from './PayForCertificateButton';
import MintCertificateButton from './MintCertificateButton';
import AuthButton from './AuthButton';

interface CertificateSectionProps {
  curriculumId: string;
}

const CertificateSection: React.FC<CertificateSectionProps> = ({ curriculumId }) => {
  const { isConnected, address } = useOriginAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkEligibility();
    }
  }, [isConnected, address, curriculumId, refreshKey]);

  const checkEligibility = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      const result = await certificatesAPI.getEligibility(curriculumId, address);
      setEligibility(result);
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleMintComplete = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!isConnected) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Blockchain Certificate
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900">
                  Connect Your Wallet
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Connect your wallet to view or mint your certificate
                </p>
              </div>
              <AuthButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Blockchain Certificate
          </h3>
          <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Blockchain Certificate
        </h3>
        
        {!eligibility?.hasPaid ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Complete your learning journey and pay for your certificate to mint it on the blockchain.
              </p>
            </div>
            <PayForCertificateButton 
              curriculumId={curriculumId} 
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-900 mb-2">
                Certificate Ready for Minting
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Curriculum:</strong> {curriculumId}</p>
                <p><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
                <p><strong>Payment Confirmed:</strong> ✓</p>
                {eligibility.certificateInfo?.paidAt && (
                  <p><strong>Paid:</strong> {new Date(eligibility.certificateInfo.paidAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <MintCertificateButton 
              curriculumId={curriculumId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateSection;