# vegetables-before-candy frontend

Next.js frontend for vegetables-before-candy, a Stellar Soroban behavior-incentive platform.

## Core capabilities

- User account onboarding and verification UX
- Task creation and completion flows
- Stellar wallet connection (Freighter)
- Task submission and reward claiming UX backed by Soroban transactions
- On-chain reward escrow and verification

## Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- React Query + Context APIs
- Stellar SDK integration

## Local development

```bash
npm install
npm run dev
```

## Required environment values

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=vegetables-before-candy
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=C...
```

## Wallet behavior

- Connects to Freighter if installed
- Persists wallet connection locally
- Displays active Stellar network label in the UI

## Build commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`