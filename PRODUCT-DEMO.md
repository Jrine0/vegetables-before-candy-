# Product Demo Guide

vegetables-before-candy demo flow focused on Stellar Soroban task-reward enforcement.

## Demo flow (8 minutes)

1. Register a user account.
2. Create a task with reward escrow (e.g., "Complete daily exercise").
3. Submit task completion proof.
4. Admin/oracle verifies the task completion.
5. Claim the escrowed reward on Stellar.
6. Show the enforced task→verification→reward flow in Soroban explorer.

## Talking points

- Rewards are escrowed on-chain until task verification
- No bypassing the completion→verification→reward sequence
- Soroban contract enforces behavior incentives transparently
- The architecture supports any task type (fitness, study, habits, etc.)

## Environment checklist

- Backend running on `http://localhost:3001`
- Frontend running on `http://localhost:3000`
- Stellar network configured (`testnet` or `mainnet`)
- `STELLAR_ADMIN_PRIVATE_KEY`, `SOROBAN_CONTRACT_ID` configured
- Freighter wallet installed
