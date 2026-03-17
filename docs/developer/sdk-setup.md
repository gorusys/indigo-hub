# Indigo TypeScript SDK

This module explains how to **set up and use the Indigo TypeScript SDK** to interact with Indigo’s contracts from Node.js or the browser (e.g. wallet integration).

## Learning outcomes

- Install and configure the Indigo SDK (or the official client library).
- Connect to Cardano (via wallet or backend) and read CDP/oracle state.
- Use the SDK to build transactions for common operations (e.g. open CDP, mint, repay).

## Prerequisites

- Node.js (e.g. 18+) and npm or yarn.
- Basic familiarity with TypeScript/JavaScript and Cardano (wallets, addresses, transactions).
- For mainnet: a wallet with ADA and (optionally) collateral; for testing: testnet setup.

## Installation

Indigo may provide an npm package or a GitHub repo for the TypeScript/client library. Typical steps:

```bash
npm install @indigoprotocol/sdk
# or
yarn add @indigoprotocol/sdk
```

If the package name or repo differs, check the [official Indigo documentation](https://docs.indigoprotocol.io/) and the repo’s README for the current install command and peer dependencies (e.g. `@cardano-sdk/web-extension` or similar for wallet integration).

## Configuration

You usually need to specify:

- **Network** — Mainnet or testnet (e.g. `mainnet` or `preprod`).
- **Provider** — How to submit transactions and read the chain: either a **wallet** (e.g. Nami, Eternl) in the browser, or a **backend** using a Cardano node or an RPC provider (e.g. Blockfrost, Koios).

Example (conceptual; API may differ):

```typescript
import { IndigoSDK } from '@indigoprotocol/sdk';

const sdk = new IndigoSDK({
  network: 'mainnet',
  // Wallet provider for browser; or use a backend provider
  provider: walletProvider,
});
```

Refer to the SDK’s types and docs for the exact options (provider interface, network IDs, and any contract addresses or config the SDK needs).

## Reading state

Before building transactions, you often need current state:

- **User’s CDPs** — Query UTxOs at the CDP script address that belong to the user (e.g. by owner in datum or by output address). The SDK may expose `getUserCdps(walletAddress)` or similar.
- **Oracle prices** — Read the latest oracle UTxO(s) to get current collateral and iAsset prices. The SDK might provide `getOraclePrices()` or you may need to query by script address.
- **Protocol parameters** — Minimum collateralization ratio, stability pool info, etc. These might come from the SDK config or from chain state.

Use the SDK’s documented methods when available; they encapsulate the correct script addresses and datum parsing.

## Building transactions

Typical operations and how they map to the SDK:

| Operation | SDK usage (conceptual) |
|-----------|------------------------|
| Open CDP | `sdk.openCdp({ collateralAmount, mintAmount, collateralAsset })` → returns a transaction to sign and submit. |
| Mint more | `sdk.mintMore({ cdpUtxo, additionalMintAmount })` → consumes the CDP UTxO, produces updated CDP + minted iAsset. |
| Repay debt | `sdk.repay({ cdpUtxo, repayAmount })` → burns iAsset and updates CDP datum. |
| Add collateral | `sdk.addCollateral({ cdpUtxo, additionalCollateral })` → updates CDP with more collateral. |
| Close CDP | `sdk.closeCdp({ cdpUtxo })` → repay full debt, burn iAsset, withdraw collateral. |
| Deposit to Stability Pool | `sdk.depositToStabilityPool({ amount })` → deposit iUSD into the pool. |

The exact method names and parameters will follow the SDK you use. After building, you **sign** the transaction with the user’s wallet (or backend keys) and **submit** it to the network.

## Error handling

- **Insufficient collateral or balance** — Validate amounts and ratios before building; the SDK or chain may return a clear error.
- **Under-collateralized** — Protocol will not allow minting that would bring the ratio below minimum; SDK or validator will fail.
- **Oracle or script errors** — Ensure you’re on the right network and that the SDK and contract versions match. Check error messages and the docs.

Always handle errors in production (e.g. show a clear message to the user or retry logic for transient failures).

## Summary

- **Install** the official Indigo SDK/client package and any peer dependencies.
- **Configure** network and provider (wallet or backend).
- **Read state** (CDPs, oracle prices, parameters) via SDK helpers.
- **Build** transactions with SDK methods (open CDP, mint, repay, Stability Pool, etc.), then sign and submit.
- **Handle errors** and validate inputs before building transactions.

Next: [Code Lab – Mint iUSD](code-lab-mint-iusd.md) — a step-by-step script to mint iUSD using the SDK.
