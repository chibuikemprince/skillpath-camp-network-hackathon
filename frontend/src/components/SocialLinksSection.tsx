import React from 'react';
import { CampModal, LinkButton } from '@campnetwork/origin/react';
import { Share2 } from 'lucide-react';

const SocialLinksSection: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Share2 className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Social Linking</p>
            <p className="text-xs text-gray-600">Connect Twitter, Discord, Spotify via Origin Auth.</p>
          </div>
        </div>
        <CampModal />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <LinkButton social="twitter" />
        <LinkButton social="spotify" />
        <LinkButton social="tiktok" />
      </div>
    </div>
  );
};

export default SocialLinksSection;
