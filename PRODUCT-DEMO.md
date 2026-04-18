# Product Demo Guide

future me demo flow focused on Aptos on-chain verification.

## Demo flow (8 minutes)

1. Register a student account with a supported university domain.
2. Upload a GPA, research, or leadership achievement with proof.
3. Verify the achievement through admin workflow.
4. Connect an Aptos wallet (Petra or Martian).
5. Mint the soul-bound NFT on Aptos.
6. Request a gated opportunity and show successful on-chain access assertion.
7. Open transaction in Aptos explorer and show emitted events.

## Talking points

- Credentials are verified before minting and cannot be transferred.
- Opportunity access is decided by on-chain ownership checks, not UI-only checks.
- Move modules are capability-based and emit auditable events.
- The architecture supports additional universities and achievement categories.

## Environment checklist

- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Aptos network configured (`testnet` or `mainnet`)
- `APTOS_ADMIN_PRIVATE_KEY`, `APTOS_MODULE_ADDRESS`, and `APTOS_ACCESS_MODULE_ADDRESS` configured
- Petra or Martian wallet installed
