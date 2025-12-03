import React, { useState, useEffect } from 'react';
import { Award, ExternalLink, CreditCard } from 'lucide-react';
import { ethers } from 'ethers';
import { certificatesAPI, curriculumAPI } from '../services/api';
import { CertificateEligibility } from '../types';
import { CERTIFICATE_CONFIG } from '../config/certificate';


interface MintCertificateButtonProps {
  curriculumId: string;
}

const MintCertificateButton: React.FC<MintCertificateButtonProps> = ({ curriculumId }) => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [metaMaskAccount, setMetaMaskAccount] = useState<string>('');
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [certificatePrice, setCertificatePrice] = useState<string>('0');
  const [courseData, setCourseData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    init();
  }, [curriculumId]);

  const init = async () => {
    await checkMetaMaskConnection();
    await loadData();
    setLoading(false);
  };

  const checkMetaMaskConnection = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setMetaMaskAccount(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking MetaMask:', error);
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          console.log('MetaMask connected:', accounts[0]);
          setMetaMaskAccount(accounts[0]);
          await loadEligibility(accounts[0]);
        }
      } catch (error) {
        console.error('Error connecting MetaMask:', error);
        alert('Failed to connect MetaMask');
      }
    } else {
      alert('MetaMask not installed');
    }
  };

  const loadData = async () => {
    try {
      const [curriculum, dashboard, price] = await Promise.all([
        curriculumAPI.get(),
        curriculumAPI.getDashboard(),
        certificatesAPI.getCertificatePrice()
      ]);
      setCourseData(curriculum.curriculum);
      setDashboardData(dashboard.dashboard);
      setCertificatePrice(price.priceWei);
      
      if (metaMaskAccount) {
        await loadEligibility(metaMaskAccount);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadEligibility = async (account: string) => {
    try {
      console.log('Loading eligibility for:', account, 'curriculum:', curriculumId);
      const eligibilityResult = await certificatesAPI.getEligibility(curriculumId, account);
      console.log('Eligibility result:', eligibilityResult);
      setEligibility(eligibilityResult);
    } catch (error) {
      console.error('Error loading eligibility:', error);
    }
  };

  const makePayment = async () => {
    if (!metaMaskAccount) {
      alert('Please connect MetaMask first');
      return;
    }

    setProcessing(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: CERTIFICATE_CONFIG.PAYMENT_ADDRESS,
        value: certificatePrice
      });
      
      await tx.wait();
      await certificatesAPI.confirmPayment(curriculumId, metaMaskAccount, tx.hash);
      
      await loadEligibility(metaMaskAccount);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const mintCertificate = async () => {
    if (!metaMaskAccount || !courseData || !dashboardData) {
      alert('Missing required data');
      return;
    }

    setProcessing(true);
    try {
      // Check if can mint
      const mintRequest = await certificatesAPI.requestMint(curriculumId, metaMaskAccount);
      
      if (!mintRequest.canMint) {
        alert(mintRequest.reason || 'Cannot mint certificate');
        return;
      }

      // Import Origin SDK only when needed for minting
      const { Origin } = await import('@campnetwork/origin');
      const { buildCertificateJson } = await import('../utils/certificateBuilder');
      
      // Initialize Origin SDK - this will prompt for Origin wallet connection
      const origin = new Origin();
      
      // Build certificate data
      const certificateData = buildCertificateJson({
        walletAddress: metaMaskAccount,
        displayName: metaMaskAccount,
        course: {
          id: curriculumId,
          title: courseData.skill,
          module: 'Full Path',
          level: 'Intermediate'
        },
        performance: {
          completionPercent: dashboardData.overallProgress || 0,
          masteryScore: 85,
          hoursStudied: dashboardData.totalWeeks * 5 || 0,
          quizzesPassed: dashboardData.completedQuizzes || 0,
          projectsCompleted: 0
        }
      });
      
      // Create file from certificate data
      const certificateBlob = new Blob([JSON.stringify(certificateData, null, 2)], {
        type: 'application/json'
      });
      const certificateFile = new File([certificateBlob], 'certificate.json', {
        type: 'application/json'
      });
      
      // Mint certificate using Origin SDK - this will prompt for Origin wallet
      const result = await origin.mintFile(
        certificateFile,
        { title: `${courseData.skill} Certificate`, description: 'SkillPath Learning Certificate' },
        'CC0-1.0' as any
      );
      
      if (!result) {
        throw new Error('Minting failed - no result returned');
      }
      
      const tokenId = result || 'Unknown';
      const txHash = 'Unknown';
      
      // Record the mint in backend
      await certificatesAPI.recordMint(curriculumId, metaMaskAccount, tokenId, txHash);
      
      // Refresh eligibility
      await loadEligibility(metaMaskAccount);
      
      alert('Certificate minted successfully!');
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 w-48 rounded"></div>;
  }

  if (!metaMaskAccount) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Connect MetaMask</p>
            <p className="text-xs text-gray-600">Connect MetaMask to pay for certificate</p>
          </div>
          <button
            onClick={connectMetaMask}
            className="inline-flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  // Debug: Show current state
  console.log('Current state:', { metaMaskAccount, eligibility, courseData, dashboardData });

  // Step 1: Check qualification
  if (!eligibility) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">Loading eligibility...</p>
      </div>
    );
  }

  if (!eligibility.eligible) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div>
          <p className="text-sm text-yellow-800">Complete all course requirements to qualify for certificate</p>
          <p className="text-xs text-yellow-600 mt-1">Connected: {metaMaskAccount?.slice(0, 6)}...{metaMaskAccount?.slice(-4)}</p>
        </div>
      </div>
    );
  }

  // Step 4: Certificate already minted - show view button
  if (eligibility.certificateInfo?.tokenId) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Certificate Minted</p>
              <p className="text-xs text-green-600">Token ID: {eligibility.certificateInfo.tokenId}</p>
            </div>
          </div>
          <a
            href={`${CERTIFICATE_CONFIG.CAMP_NETWORK_EXPLORER}/token/${eligibility.certificateInfo.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            View Certificate
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  // Step 2 & 3: Payment required or mint ready
  if (!eligibility.hasPaid) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">Payment Required</p>
              <p className="text-xs text-blue-600">Price: {ethers.formatEther(certificatePrice)} ETH</p>
            </div>
          </div>
          <button
            onClick={makePayment}
            disabled={processing}
            className="inline-flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Pay with MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Payment completed, ready to mint
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-800">Ready to Mint</p>
            <p className="text-xs text-purple-600">Payment verified - mint your certificate</p>
          </div>
        </div>
        <button
          onClick={mintCertificate}
          disabled={processing}
          className="inline-flex items-center px-4 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {processing ? 'Minting...' : 'Mint Certificate'}
        </button>
      </div>
    </div>
  );
};

export default MintCertificateButton;