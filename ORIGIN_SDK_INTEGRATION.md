# Origin SDK Integration - Complete Implementation

## Overview
This implementation integrates the Origin SDK for a complete certificate payment and minting flow on the Camp Network blockchain.

## User Journey
1. **Authentication**: User connects wallet via Origin SDK
2. **Payment**: User pays for certificate with native CAMP tokens
3. **Verification**: Backend verifies payment on-chain
4. **Eligibility**: Frontend checks if user can mint certificate
5. **Minting**: User mints NFT certificate using Origin SDK

## Key Files Created/Modified

### Frontend
- `src/hooks/useOriginAuth.ts` - Origin SDK auth wrapper
- `src/utils/toWei.ts` - Wei conversion utility
- `src/components/AuthButton.tsx` - Origin SDK authentication
- `src/components/PayForCertificateButton.tsx` - Payment with viem
- `src/components/MintCertificateButton.tsx` - NFT minting with Origin SDK
- `src/main.tsx` - CampProvider integration
- `src/services/api.ts` - Updated API endpoints

### Backend
- `src/types/payment.ts` - Payment type definitions
- `src/services/paymentService.ts` - Transaction verification
- `src/controllers/paymentController.ts` - Payment endpoints
- `src/routes/payments.ts` - Payment routes
- `src/server.ts` - Added payment routes

## Environment Variables

### Frontend (.env)
```
VITE_ORIGIN_CLIENT_ID=your_origin_client_id_here
VITE_MERCHANT_ADDRESS=0xYourMerchantAddressHere
VITE_NETWORK_RPC_URL=https://rpc.camp.network
```

### Backend (.env)
```
MERCHANT_ADDRESS=0xYourMerchantAddressHere
RPC_URL=https://rpc.camp.network
CERT_PRICE_WEI=50000000000000000
```

## How to Run

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Technical Implementation

### Payment Flow
1. User clicks "Pay for Certificate"
2. Creates viem wallet client from Origin SDK
3. Sends native token transaction to merchant address
4. Backend verifies transaction on-chain
5. Stores payment record in database

### Minting Flow
1. User clicks "Mint Certificate"
2. Creates certificate metadata JSON
3. Uses Origin SDK `origin.mintFile()` to mint NFT
4. Records mint transaction in backend

### Key Features
- **On-chain verification**: All payments verified via RPC
- **Origin SDK integration**: Native wallet connection and NFT minting
- **Secure flow**: JWT authentication and transaction verification
- **Error handling**: Comprehensive error handling throughout

## Dependencies Added
- `@campnetwork/origin` - Origin SDK for React
- `viem` - Ethereum client library
- Both frontend and backend updated with necessary packages

This implementation provides a complete, production-ready certificate payment and minting system using the Origin SDK and Camp Network blockchain.