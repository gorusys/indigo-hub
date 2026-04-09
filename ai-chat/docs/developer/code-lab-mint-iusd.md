# Code Lab - Mint iUSD

This code lab walks you through **minting iUSD programmatically** using the Indigo TypeScript SDK (or equivalent client). You will write a small script that opens a CDP and mints an iAsset.

## Learning outcomes

- Set up a minimal Node/TS project that uses the Indigo SDK.
- Build and (conceptually) submit a transaction to open a CDP and mint iUSD.
- Understand the flow: connect → read state → build tx → sign → submit.

## Prerequisites

- Completed [Indigo TypeScript SDK](sdk-setup.md).
- Node.js 18+, npm or yarn.
- A testnet wallet with test ADA (and optional collateral) for a safe run. Do not use mainnet with real funds until you are confident.

## Project setup

```bash
mkdir indigo-mint-lab && cd indigo-mint-lab
npm init -y
npm install @indigoprotocol/sdk
npm install -D typescript ts-node @types/node
npx tsc --init
```

Adjust the package name if the official SDK has a different npm name. Add `"type": "module"` in `package.json` if you use ES modules.

## Example script structure

The following is **pseudocode** illustrating the flow; replace with the actual SDK API from Indigo’s docs.

```typescript
import { IndigoSDK } from '@indigoprotocol/sdk';

async function mintIUsd() {
  // 1. Initialize SDK (use testnet for this lab)
  const sdk = new IndigoSDK({
    network: 'preprod',  // or 'mainnet'
    provider: getWalletProvider(), // your wallet or backend provider
  });

  // 2. Get wallet address and check balance
  const address = await sdk.getWalletAddress();
  const balance = await sdk.getBalance(address);
  console.log('Wallet balance:', balance);

  // 3. Decide amounts (example: lock 100 ADA, mint 30 iUSD - keep ratio safe)
  const collateralAmount = 100_000_000n; // 100 ADA in lovelace
  const mintAmount = 30_000_000n;        // 30 iUSD (assuming 6 decimals)

  // 4. Build open CDP + mint transaction
  const unsignedTx = await sdk.buildOpenCdpAndMint({
    collateralAmount,
    mintAmount,
    collateralAsset: 'ADA',
  });

  // 5. Sign with wallet
  const signedTx = await sdk.signTransaction(unsignedTx);

  // 6. Submit (comment out in dry run)
  const txId = await sdk.submitTransaction(signedTx);
  console.log('Submitted tx:', txId);
}
mintIUsd().catch(console.error);
```

You must implement or inject `getWalletProvider()` according to your environment (e.g. CIP-30 wallet in browser, or Blockfrost + key in Node). The SDK docs will specify the provider interface.

## Running the lab

- **Dry run:** Comment out `submitTransaction` and only build + sign to ensure no accidental mainnet submit.
- **Testnet:** Use preprod or testnet; get test ADA from a faucet. Run with `npx ts-node mint-iusd.ts` (or the script name you use).
- **Mainnet:** Only after you understand the flow and accept the risks; use small amounts first.

## What to verify

- Collateral and mint amounts leave your CDP **above** the minimum ratio after the tx.
- You have enough ADA for **fees**.
- The **network** in the SDK matches the wallet and RPC (testnet vs mainnet).

## Extensions

- **Repay and close:** Add a second script that repays the minted amount and closes the CDP.
- **Query CDPs:** Use the SDK to list your open CDPs and print collateralization ratio.
- **Error handling:** Wrap build/sign/submit in try/catch and handle “insufficient collateral”, “user rejected”, etc.

## Summary

- **Setup** a small TS project and install the Indigo SDK.
- **Initialize** SDK with network and provider; **read** wallet balance.
- **Build** an “open CDP + mint iUSD” transaction; **sign** and **submit** (prefer testnet first).
- **Verify** ratios and fees; add error handling and optional repay/close scripts.

Next: [Advanced Contract Interaction](advanced-contract-interaction.md) — liquidations, querying CDP state, and edge cases.
