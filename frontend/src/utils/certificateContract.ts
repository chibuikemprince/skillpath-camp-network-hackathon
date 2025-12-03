import { ethers } from 'ethers';

const DEFAULT_RPC = import.meta.env.VITE_NETWORK_RPC_URL || 'https://rpc.basecamp.t.raas.gelato.cloud';

export const CERT_CONTRACT_ADDRESS = import.meta.env.VITE_CERT_CONTRACT_ADDRESS || '';

const abi = [
  {
    inputs: [
      { internalType: 'string', name: 'userId', type: 'string' },
      { internalType: 'address', name: 'wallet', type: 'address' },
      { internalType: 'string', name: 'curriculumId', type: 'string' },
      { internalType: 'string', name: 'metadataUri', type: 'string' },
    ],
    name: 'issueCertificate',
    outputs: [{ internalType: 'bytes32', name: 'certKey', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'userId', type: 'string' },
      { internalType: 'address', name: 'wallet', type: 'address' },
    ],
    name: 'getCertificate',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'userId', type: 'string' },
          { internalType: 'string', name: 'walletId', type: 'string' },
          { internalType: 'string', name: 'curriculumId', type: 'string' },
          { internalType: 'string', name: 'metadataUri', type: 'string' },
          { internalType: 'uint256', name: 'issuedAt', type: 'uint256' },
          { internalType: 'address', name: 'issuer', type: 'address' },
          { internalType: 'bool', name: 'exists', type: 'bool' },
        ],
        internalType: 'struct CampCertificate.Certificate',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'userId', type: 'string' },
      { internalType: 'address', name: 'wallet', type: 'address' },
    ],
    name: 'hasCertificate',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'certKey', type: 'bytes32' },
      { indexed: true, internalType: 'string', name: 'userId', type: 'string' },
      { indexed: true, internalType: 'address', name: 'wallet', type: 'address' },
      { indexed: false, internalType: 'string', name: 'curriculumId', type: 'string' },
      { indexed: false, internalType: 'string', name: 'metadataUri', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'issuedAt', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'issuer', type: 'address' },
    ],
    name: 'CertificateIssued',
    type: 'event',
  },
];

export type OnchainCertificate = {
  userId: string;
  walletId: string;
  curriculumId: string;
  metadataUri: string;
  issuedAt: bigint;
  issuer: string;
  exists: boolean;
};

export function getContract(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
  if (!CERT_CONTRACT_ADDRESS) {
    throw new Error('Certificate contract address not configured');
  }
  return new ethers.Contract(CERT_CONTRACT_ADDRESS, abi, signerOrProvider);
}

export async function fetchOnchainCertificate(userId: string, wallet: string): Promise<OnchainCertificate | null> {
  const provider = new ethers.providers.JsonRpcProvider(DEFAULT_RPC);
  const contract = getContract(provider);
  const cert = await contract.getCertificate(userId, wallet);
  if (!cert.exists) return null;
  return cert as OnchainCertificate;
}

export async function writeCertificate(params: {
  userId: string;
  wallet: string;
  curriculumId: string;
  metadataUri: string;
}) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  const signer = provider.getSigner();
  const contract = getContract(signer);
  const tx = await contract.issueCertificate(params.userId, params.wallet, params.curriculumId, params.metadataUri);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

export async function writeCertificateWithSigner(
  signer: ethers.Signer,
  params: { userId: string; wallet: string; curriculumId: string; metadataUri: string }
) {
  const contract = getContract(signer);
  const tx = await contract.issueCertificate(params.userId, params.wallet, params.curriculumId, params.metadataUri);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}
