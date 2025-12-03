import React from 'react';
import MintCertificateButton from './MintCertificateButton';
import SocialLinksSection from './SocialLinksSection';

interface CertificateSectionProps {
  curriculumId: string;
}

const CertificateSection: React.FC<CertificateSectionProps> = ({ curriculumId }) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Blockchain Certificate</h3>
            <p className="text-xs text-gray-500">Qualify, then mint with WalletConnect / Thirdweb.</p>
          </div>
        </div>
        <div className="space-y-4">
          <SocialLinksSection />
          <MintCertificateButton curriculumId={curriculumId} />
        </div>
      </div>
    </div>
  );
};

export default CertificateSection;
