import { useAuth } from '@campnetwork/origin/react';

export const useOriginAuth = () => {
  const auth = useAuth();
  
  return {
    jwt: auth.jwt,
    origin: auth.origin,
    viem: auth.viem,
    address: (auth as any).address,
    isConnected: !!(auth as any).address,
    connect: (auth as any).connect ? () => (auth as any).connect() : undefined,
    disconnect: (auth as any).disconnect ? () => (auth as any).disconnect() : undefined,
    auth
  };
};
