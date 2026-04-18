# future me

future me is an Aptos-native academic achievement platform where verified student milestones are minted as soul-bound Move NFTs and used for on-chain opportunity access control.

## Overview

The platform combines:
- Aptos Move smart contracts for achievement NFTs and gated access checks
- A Node.js + Express + TypeScript backend with JWT auth and university email workflows
- A Next.js frontend with Aptos wallet integration (Petra and Martian)

## Aptos Architecture

### Move modules
- `achievement_nft.move`
	- Mints soul-bound achievement NFTs (`gpa_guardian`, `research_rockstar`, `leadership_legend`)
	- Stores ownership indices for fast lookup
	- Emits mint and verification events
	- Enforces non-transferability at contract level (`transfer_soulbound` always aborts)
- `access_control.move`
	- Verifies required achievement types on-chain
	- Emits access verification events
	- Aborts when access is denied

### Security model
- Capability-based controls (`AdminCap`, `MintCap`, `AccessAdminCap`)
- Explicit supported-type validation before mint and access assertion
- Resource-account aware registry storage pattern

## Backend responsibilities

- JWT authentication and email verification
- Achievement proof upload and validation workflows
- Aptos transaction submission for mint and access assertions
- Aptos ownership checks and event retrieval

Primary Aptos backend route: `/api/aptos`

## Frontend responsibilities

- Connect Aptos wallets (Petra or Martian)
- Trigger Aptos-backed minting flows
- Present ownership-gated opportunity UX
- Display Aptos network/account status in navigation

## Local setup

### Prerequisites
- Node.js 18+
- Aptos CLI

### Install
```bash
npm install
npm run install:all
```

### Configure backend
Create `backend/.env` with at least:
```env
PORT=3001
JWT_SECRET=replace-with-secure-secret
FRONTEND_URL=http://localhost:3000

APTOS_NETWORK=testnet
APTOS_FULLNODE_URL=https://api.testnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.testnet.aptoslabs.com
APTOS_ADMIN_PRIVATE_KEY=0x...
APTOS_MODULE_ADDRESS=0x...
APTOS_ACCESS_MODULE_ADDRESS=0x...
```

### Configure frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=future me
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=0x...
NEXT_PUBLIC_APTOS_ACCESS_MODULE_ADDRESS=0x...
```

### Database
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Run
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## Smart contract workflow

From `contracts/`:
```bash
npm run compile
npm run test
npm run publish:testnet
```

## Achievement types

- GPA-based NFT: `gpa_guardian`
- Research-based NFT: `research_rockstar`
- Leadership-based NFT: `leadership_legend`

## Opportunity gating flow

1. User submits verified achievement
2. Backend mints Aptos soul-bound NFT via `achievement_nft::mint_soulbound`
3. User requests opportunity access
4. Backend calls `access_control::assert_access`
5. Access is granted only when on-chain ownership requirements are satisfied

## Supported university domains

- @emich.edu
- @eastern.edu
- @tesu.edu
- @oakland.edu
- @vt.edu

