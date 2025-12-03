import { createThirdwebClient, getContract } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';
import { certificateAbi } from './abis/campCertificateAbi';

const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || '';
const CONTRACT_ADDRESS = import.meta.env.VITE_CERT_CONTRACT_ADDRESS || '';
const RPC_URL = import.meta.env.VITE_NETWORK_RPC_URL || 'https://rpc.basecamp.t.raas.gelato.cloud';

export const thirdwebClient = createThirdwebClient({ clientId: CLIENT_ID });

export const BASECAMP_CHAIN = defineChain({
  id: 123420001114,
  name: 'Basecamp',
  nativeCurrency: { name: 'CAMP', symbol: 'CAMP', decimals: 18 },
  rpc: [RPC_URL, 'https://rpc-campnetwork.xyz'],
  blockExplorers: [{ name: 'Basecamp Explorer', url: 'https://basecamp.cloud.blockscout.com/' }],
  testnet: true,
});

export const SUPPORTED_WALLETS = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
  createWallet('io.rabby'),
  createWallet('com.trustwallet.app'),
  createWallet('io.zerion.wallet'),
  createWallet('com.okex.wallet'),
];

export const certificateContract = CONTRACT_ADDRESS
  ? getContract({
      client: thirdwebClient,
      chain: BASECAMP_CHAIN,
      address: CONTRACT_ADDRESS,
      abi: certificateAbi,
    })
  : null;
