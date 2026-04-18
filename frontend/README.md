# future me frontend

Next.js frontend for future me, an Aptos-native academic achievement platform.

## Core capabilities

- University account onboarding and verification UX
- Achievement submission and validation flows
- Aptos wallet connection (Petra and Martian)
- Soul-bound NFT minting UX backed by Aptos transactions
- On-chain ownership-gated opportunity access

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- React Query + Context APIs
- Aptos TypeScript SDK integration

## Local development

```bash
npm install
npm run dev
```

## Required environment values

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=future me
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=0x...
NEXT_PUBLIC_APTOS_ACCESS_MODULE_ADDRESS=0x...
```

## Wallet behavior

- Connects to Petra or Martian if installed
- Persists selected wallet locally
- Displays active Aptos network label in the UI

## Build commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`