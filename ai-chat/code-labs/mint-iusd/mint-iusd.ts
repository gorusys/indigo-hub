/**
 * Code lab: Mint iUSD using the Indigo SDK
 *
 * This is a minimal example for educational use. Use testnet and small
 * amounts. Replace @indigoprotocol/sdk with the actual package name from
 * Indigo's documentation when available.
 *
 * NOT FINANCIAL ADVICE. For learning only.
 */

// When the official SDK is available, use:
// import { IndigoSDK } from '@indigoprotocol/sdk';

const DRY_RUN = process.env.DRY_RUN === '1';

async function main() {
  console.log('Indigo mint iUSD code lab');
  console.log('Network: use testnet (preprod) for learning');
  console.log('DRY_RUN:', DRY_RUN);

  // 1. Initialize SDK (uncomment when SDK is installed)
  // const sdk = new IndigoSDK({
  //   network: process.env.NETWORK || 'preprod',
  //   provider: getWalletProvider(), // implement per environment
  // });

  // 2. Get wallet address and balance
  // const address = await sdk.getWalletAddress();
  // const balance = await sdk.getBalance(address);

  // 3. Build open CDP + mint transaction
  // const collateralAmount = 100_000_000n; // 100 ADA (lovelace)
  // const mintAmount = 30_000_000n;        // 30 iUSD (adjust decimals per SDK)
  // const unsignedTx = await sdk.buildOpenCdpAndMint({
  //   collateralAmount,
  //   mintAmount,
  //   collateralAsset: 'ADA',
  // });

  // 4. Sign and submit (skip submit if DRY_RUN)
  // const signedTx = await sdk.signTransaction(unsignedTx);
  // if (!DRY_RUN) {
  //   const txId = await sdk.submitTransaction(signedTx);
  //   console.log('Submitted tx:', txId);
  // }

  console.log('Placeholder: install @indigoprotocol/sdk and implement getWalletProvider().');
  console.log('See docs/developer/code-lab-mint-iusd.md for the full walkthrough.');
}

main().catch(console.error);
