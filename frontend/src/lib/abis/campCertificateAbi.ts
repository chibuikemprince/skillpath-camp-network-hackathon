export const certificateAbi = [
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
