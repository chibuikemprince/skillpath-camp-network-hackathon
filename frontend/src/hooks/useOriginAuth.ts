import { useAuth } from '@campnetwork/origin/react';

export const useOriginAuth = () => {
  const auth = useAuth();
  
  return {
    jwt: auth.jwt,
    origin: auth.origin,
    viem: auth.viem,
    address: (auth as any).address,
    isConnected: !!(auth as any).address
  };
};