import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import { certificatesAPI } from '../services/api';
import { CertificateEligibility } from '../types';

interface PayForCertificateButtonProps {
  curriculumId: string;
  onPaymentComplete?: () => void;
}

const PayForCertificateButton: React.FC<PayForCertificateButtonProps> = ({ 
  curriculumId,
  onPaymentComplete 
}) => {
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [price, setPrice] = useState<{ priceWei: string; priceEth: string } | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkMetaMaskConnection();
    loadPrice();
  }, [curriculumId]);

  useEffect(() => {
    if (isConnected && account) {
      loadEligibility();
    }
  }, [isConnected, account, curriculumId]);

  const checkMetaMaskConnection = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking MetaMask:', error);
      }
    }
    setLoading(false);
  };

  const connectMetaMask = async () => {
    if (typeof (window as any).ethereum === 'undefined') {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Error connecting MetaMask:', error);
    }
  };

  const loadEligibility = async () => {
    if (!account) return;
    
    try {
      const result = await certificatesAPI.getEligibility(curriculumId, account);
      setEligibility(result);
    } catch (error) {
      console.error('Error loading eligibility:', error);
    }
  };

  const loadPrice = async () => {
    try {
      const result = await certificatesAPI.getCertificatePrice();
      setPrice(result);
    } catch (error) {
      console.error('Error loading price:', error);
    }
  };



  const payForCertificate = async () => {
    if (!isConnected || !account) {
      alert('Please connect MetaMask first');
      return;
    }

    if (!price) {
      alert('Price not loaded');
      return;
    }

    setPaying(true);
    try {
      const txHash = await (window as any).ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: import.meta.env.VITE_MERCHANT_ADDRESS,
          value: '0x' + BigInt(price.priceWei).toString(16),
        }],
      });
      
      await certificatesAPI.confirmPayment(curriculumId, account, txHash);
      await loadEligibility();
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-10 w-48 rounded"></div>
    );
  }

  if (!eligibility) {
    return null;
  }

  if (!eligibility.eligible) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Certificate Not Available</p>
            <p className="text-xs text-yellow-600">
              {eligibility.reason || 'Complete all modules and pass all tests with at least 50% to unlock your certificate.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (eligibility.hasPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">Payment Completed</p>
            <p className="text-xs text-green-600">Ready to mint your certificate!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-800">Certificate Available</p>
            <p className="text-xs text-blue-600">Price: {price?.priceEth || '...'} ETH</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isConnected ? (
            <button
              onClick={connectMetaMask}
              className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Connect MetaMask
            </button>
          ) : (
            <button
              onClick={payForCertificate}
              disabled={paying}
              className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {paying ? 'Processing...' : `Pay ${price?.priceEth || '...'} ETH`}
            </button>
          )}
        </div>
      </div>
      
      {isConnected && (
        <div className="mt-2 text-xs text-gray-500">
          Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default PayForCertificateButton;