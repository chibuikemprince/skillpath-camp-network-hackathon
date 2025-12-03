import React from 'react';
import { CampModal } from '@campnetwork/origin/react';
import { useOriginAuth } from '../hooks/useOriginAuth';

const AuthButton: React.FC = () => {
  const { address, isConnected } = useOriginAuth();

  return (
    <div className="flex items-center space-x-4">
      <CampModal />
      {isConnected && (
        <span className="text-sm text-gray-600">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      )}
    </div>
  );
};

export default AuthButton;