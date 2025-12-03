import React, { useState, useEffect } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { certificatesAPI, curriculumAPI } from '../services/api';
import { CertificateEligibility } from '../types';
import { CERTIFICATE_CONFIG } from '../config/certificate';
import { buildCertificateJson } from '../utils/certificateBuilder';
import { CERT_CONTRACT_ADDRESS, fetchOnchainCertificate, writeCertificateWithSigner } from '../utils/certificateContract';

interface MintCertificateButtonProps {
  curriculumId: string;
}

const shorten = (addr?: string) => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

const MintCertificateButton: React.FC<MintCertificateButtonProps> = ({ curriculumId }) => {
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [eligibility, setEligibility] = useState<CertificateEligibility | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [onchainCert, setOnchainCert] = useState<any>(null);
  const account = useActiveAccount();
  const walletAddress = account?.address;

  useEffect(() => {
    init();
  }, [curriculumId, walletAddress]);

  const init = async () => {
    setLoading(true);
    await Promise.all([loadCourseData(), loadEligibility(), loadOnchainCertificate(walletAddress)]);
    setLoading(false);
  };

  const loadCourseData = async () => {
    try {
      const [curriculum, dashboard] = await Promise.all([
        curriculumAPI.get(),
        curriculumAPI.getDashboard()
      ]);
      setCourseData(curriculum.curriculum);
      setDashboardData(dashboard.dashboard);
    } catch (error) {
      console.error('Error loading course data:', error);
    }
  };

  const loadEligibility = async () => {
    try {
      const result = await certificatesAPI.getCourseEligibility(curriculumId);
      setEligibility(result);
    } catch (error) {
      console.error('Error loading eligibility:', error);
    }
  };

  const loadOnchainCertificate = async (wallet?: string) => {
    if (!wallet || !courseData?.userId) return;
    try {
      const cert = await fetchOnchainCertificate(courseData.userId, wallet);
      setOnchainCert(cert);
    } catch (error) {
      console.error('Error fetching on-chain certificate:', error);
    }
  };

  const mintCertificate = async () => {
    if (!eligibility?.eligible) {
      alert('You must pass all quizzes with 50%+ to qualify.');
      return;
    }
    if (!walletAddress) {
      alert('Connect a wallet first');
      return;
    }
    const signer = account?.wallet?.getSigner ? await account.wallet.getSigner() : undefined;
    if (!courseData || !dashboardData) {
      alert('Missing course data. Please reload the page.');
      return;
    }
    if (!CERT_CONTRACT_ADDRESS) {
      alert('Contract address not configured.');
      return;
    }

    setMinting(true);
    try {
      const masteryScores = dashboardData.masteryScores ? Object.values(dashboardData.masteryScores) as number[] : [];
      const masteryScore = masteryScores.length ? Math.min(...masteryScores) : 85;

      const userDisplay =
        (courseData as any)?.userName ||
        (courseData as any)?.userEmail ||
        (courseData as any)?.userId ||
        walletAddress;
      const level = (courseData as any)?.level || (courseData as any)?.profile?.currentLevel || 'Intermediate';

      const certificateData = buildCertificateJson({
        walletAddress,
        displayName: userDisplay,
        course: {
          id: curriculumId,
          title: courseData.skill,
          module: 'Full Path',
          level
        },
        performance: {
          completionPercent: dashboardData.overallProgress || 0,
          masteryScore,
          hoursStudied: (dashboardData.totalWeeks || 0) * 5,
          quizzesPassed: dashboardData.completedQuizzes || 0,
          projectsCompleted: 0
        }
      });

      const metadataUri = `data:application/json,${encodeURIComponent(JSON.stringify(certificateData))}`;

      if (!signer) {
        throw new Error('No signer available. Connect a wallet that supports signing.');
      }

      const { txHash, receipt } = await writeCertificateWithSigner(signer as any, {
        userId: courseData.userId || 'unknown-user',
        wallet: walletAddress,
        curriculumId,
        metadataUri
      });

      await certificatesAPI.recordMint(curriculumId, walletAddress, receipt?.logs?.[0]?.topics?.[0] || 'OnchainCert', txHash);
      await Promise.all([loadEligibility(), loadOnchainCertificate(walletAddress)]);

      alert('Certificate minted successfully!');
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Minting failed. Please try again.');
    } finally {
      setMinting(false);
    }
  };

  const mintedTokenId = eligibility?.certificateInfo?.tokenId;

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-10 w-48 rounded"></div>;
  }

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
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Keep Learning!</p>
            <p className="text-xs text-yellow-600">
              {eligibility.reason || 'Complete all modules and pass quizzes (50%+) to unlock your certificate.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (mintedTokenId || onchainCert?.exists) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Certificate Minted</p>
              <p className="text-xs text-green-600">
                On-chain: {onchainCert?.curriculumId || curriculumId} • Wallet: {shorten(walletAddress || onchainCert?.walletId)}
              </p>
              {eligibility.certificateInfo?.mintTxHash && (
                <p className="text-[11px] text-green-600">Tx: {shorten(eligibility.certificateInfo.mintTxHash)}</p>
              )}
            </div>
          </div>
          {mintedTokenId && (
            <a
              href={`${CERTIFICATE_CONFIG.CAMP_NETWORK_EXPLORER}/token/${mintedTokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              View Certificate
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Require wallet connection to proceed
  if (!walletAddress) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Connect Wallet</p>
              <p className="text-xs text-gray-600">Use WalletConnect/Thirdweb to connect to Camp Network and mint.</p>
            </div>
          </div>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  const canMint = !minting;

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className="h-5 w-5 text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-800">Ready to Mint Certificate</p>
            <p className="text-xs text-purple-600">
              Connected: {shorten(walletAddress)} — writes certificate to Camp Network smart contract.
            </p>
          </div>
        </div>
        <button
          onClick={mintCertificate}
          disabled={!canMint}
          className={`inline-flex items-center px-4 py-2 text-sm rounded ${
            canMint 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {minting ? 'Minting...' : 'Mint Certificate'}
        </button>
      </div>
    </div>
  );
};

export default MintCertificateButton;
