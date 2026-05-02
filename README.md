# vegetables-before-candy

A Stellar Soroban-based behavior-incentive platform that enforces the principle: **complete tasks before claiming rewards**. Users create tasks with escrowed rewards, submit completion proof, get oracle verification, then claim their rewards - all secured on-chain.

## Overview

The platform combines:
- Stellar Soroban smart contracts for task management and reward escrow
- A Node.js + Express + TypeScript backend with JWT auth and task verification workflows
- A Next.js frontend with Stellar wallet integration (Freighter)

## Core Concept

**Vegetables Before Candy** = Task Completion → Verification → Reward

1. **Create Task**: User defines a task with reward amount (escrowed in contract)
2. **Submit Completion**: User marks task as complete
3. **Oracle Verification**: Backend/oracle verifies completion
4. **Claim Reward**: User claims escrowed reward

This enforces behavioral incentives on-chain, preventing reward abuse and ensuring task completion.

## Soroban Architecture

### Smart Contract (`vegetable-before-candy-contract`)
- **Task Storage**: User → Vec<Task> mapping with status tracking
- **Escrow System**: Rewards locked until verification
- **Status Flow**: Created → Submitted → Verified → Claimed
- **Access Control**: Only task owner can interact with their tasks

### Security Model
- No double-claiming (status enforced)
- No bypassing verification (on-chain checks)
- Integer-safe accounting for all reward values
- Admin/oracle verification required

## Backend Responsibilities

- JWT authentication and user management
- Task creation and status tracking
- Soroban transaction submission for all operations
- Oracle verification workflows (AI/manual)
- Reward escrow management

Primary Soroban backend route: `/api/tasks`

## Frontend Responsibilities

- Connect Stellar wallets (Freighter)
- Task creation and management UI
- Completion submission flows
- Reward claiming interface
- Display Stellar network/account status

## Local Setup

### Prerequisites
- Node.js 18+
- Rust + Soroban CLI
- Stellar account with XLM for fees

### Install
```bash
npm install
npm run install:all
```

### Configure Backend
Create `backend/.env` with:
```env
PORT=3001
JWT_SECRET=replace-with-secure-secret
FRONTEND_URL=http://localhost:3000

STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_ADMIN_PRIVATE_KEY=S...
SOROBAN_CONTRACT_ID=C...
STELLAR_TOKEN_ID=native  # or contract ID for custom token
```

### Configure Frontend
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=vegetables-before-candy
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_SOROBAN_CONTRACT_ID=C...
```

### Database
```bash
cd backend
npx prisma generate
npx prisma db push
```

### Deploy Contract
```bash
cd contracts
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vegetable_before_candy_contract.wasm \
  --source S... \
  --network testnet
```

### Run
```bash
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## Smart Contract Workflow

From `contracts/`:

1. **Initialize**: Set admin and token contract
2. **Create Task**: User escrows reward, gets task ID
3. **Submit Completion**: User marks task submitted
4. **Verify Task**: Admin verifies completion
5. **Claim Reward**: User claims escrowed reward

## Task Examples

- **Fitness**: "Run 5km" → escrow 10 XLM → submit GPS proof → AI verify → claim reward
- **Study**: "Complete math homework" → escrow 5 XLM → submit photo → manual verify → claim
- **Habits**: "Meditate daily for week" → escrow 20 XLM → submit streak proof → oracle verify → claim

## API Endpoints

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `POST /api/tasks/:id/submit` - Submit completion
- `POST /api/tasks/:id/verify` - Verify task (admin)
- `POST /api/tasks/:id/claim` - Claim reward

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Security Features

- **No Reward Abuse**: Escrow prevents claiming without verification
- **No Double Claims**: Status tracking prevents reuse
- **Oracle Verification**: Human/AI verification required
- **On-Chain Transparency**: All actions recorded immutably

## Extensibility

The platform is designed for various behavior types:
- Academic achievements
- Fitness goals
- Professional development
- Personal habits
- Team challenges
- Community contributions

## Technology Stack

- **Blockchain**: Pure Stellar Soroban (Rust) - 100% native implementation
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Frontend**: Next.js, React, Tailwind CSS
- **Database**: SQLite (development) / PostgreSQL (production)
- **Wallet**: Freighter (Stellar)
- **AI**: OpenAI for verification assistance

## Task types

- Fitness tasks: `exercise_champion`
- Study tasks: `study_streak`
- Habit tasks: `habit_hero`

## Task enforcement flow

1. User creates task with escrowed reward
2. User submits task completion proof
3. Oracle verifies completion
4. User claims escrowed reward via Soroban contract
5. Reward is released only after successful verification

## Supported task categories

- Fitness & health
- Academic study
- Personal development
- Professional goals
- Community service
- Creative projects

