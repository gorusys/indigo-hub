# Getting Started with Indigo

This module walks you through using the Indigo web app: connecting a wallet, opening a CDP, and minting your first iUSD.

## Learning outcomes

- Connect a supported wallet to the Indigo app.
- Open a Collateralized Debt Position (CDP).
- Mint iUSD (or another iAsset) and understand the basic UI.

## Prerequisites

- A Cardano wallet (e.g. **Nami**, **Eternl**, **Lace**, or **Flint**) with some ADA for fees and collateral.
- Basic familiarity with your wallet (sending, receiving, approving transactions).

!!! warning "Use mainnet at your own risk"
    The following steps refer to using the live Indigo app. Start with small amounts and ensure you understand [Risks and Best Practices](risks-best-practices.md). This is not financial advice.

## Step 1: Open the Indigo app

1. Go to the official Indigo Protocol web app (check [indigoprotocol.io](https://indigoprotocol.io) for the current URL).
2. Ensure you are on the correct domain to avoid phishing.

## Step 2: Connect your wallet

1. Click **Connect wallet** (or similar) on the site.
2. Choose your wallet (Nami, Eternl, Lace, Flint, etc.).
3. Approve the connection in your wallet extension or app.
4. Once connected, the app will show your wallet address and ADA balance. You may need to approve the app to see balance and sign transactions.

## Step 3: Open a CDP (Collateralized Debt Position)

A **CDP** is your position where you lock collateral and mint iAssets.

1. In the app, find the section for **CDPs** or **Open position** / **Create CDP**.
2. Select the **collateral** you want to use (e.g. ADA or a supported liquid staking token).
3. Enter how much collateral you want to lock. The UI will show the maximum you can mint based on the current collateralization ratio.
4. Enter how much **iUSD** (or other iAsset) you want to mint. Keep a safety margin above the minimum ratio to reduce liquidation risk.
5. Review the terms, fees, and liquidation price (if shown).
6. Confirm in the app and **sign the transaction** in your wallet. Wait for confirmation on-chain.

After the transaction confirms, you have an open CDP: your collateral is locked and you hold the minted iAssets in your wallet.

## Step 4: View and manage your position

- Use the **Dashboard** or **My positions** area to see your CDP(s): collateral amount, debt (minted iAssets), and collateralization ratio.
- You can typically **add collateral**, **mint more iAssets**, or **repay debt** to change the ratio. Repaying debt (burning iAssets) and/or adding collateral improves your safety margin.
- Always be aware of the **liquidation price**: if the collateral price falls enough, your position may be liquidated. Keep a buffer.

## Step 5: Use your iUSD

Your minted iUSD is in your wallet like any other Cardano token. You can:

- **Hold** it as a stablecoin.
- **Swap** it on Cardano DEXs for ADA or other tokens.
- **Provide liquidity** in pools that include iUSD (if the app or another dApp supports it).
- **Repay** part or all of your CDP debt later by burning iUSD.

## Summary

- **Connect** a supported Cardano wallet to the Indigo app.
- **Open a CDP** by locking collateral and minting iUSD (or another iAsset).
- **Monitor** your position and liquidation price; add collateral or repay debt as needed.
- **Use** iUSD in your wallet for holding, swapping, or liquidity.

Next: [Collateral and CDPs](collateral-cdps.md) — how collateralization and liquidations work in detail.
