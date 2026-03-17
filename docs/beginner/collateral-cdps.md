# Collateral and CDPs

This module explains how **collateral** and **Collateralized Debt Positions (CDPs)** work on Indigo, and what **liquidation** means for you.

## Learning outcomes

- Explain how collateral backs minted iAssets.
- Describe what a CDP is and how the collateralization ratio works.
- Understand when and why liquidation happens and how to reduce your risk.

## What is collateral?

**Collateral** is the asset you lock in the protocol to back the iAssets you mint. On Indigo, typical collateral includes **ADA** and possibly **liquid staking tokens** (e.g. staked ADA that is represented as a token so you can use it in DeFi). The protocol values your collateral using **oracle prices**; that value determines how much debt (iAssets) you are allowed to have.

You do not “sell” your collateral when you mint — you **lock** it. As long as your position is healthy, you can later repay your debt (burn iAssets) and unlock your collateral (minus any fees).

## What is a CDP?

A **Collateralized Debt Position (CDP)** is your individual position in the protocol: it ties together:

- The **collateral** you have locked (type and amount).
- The **debt** you have minted (e.g. iUSD).
- The **collateralization ratio**: (value of collateral) ÷ (value of debt).

Example: you lock 1000 ADA and the oracle says 1 ADA = 0.50 USD. Collateral value = 500 USD. If the minimum ratio is 150%, you can mint at most 500 ÷ 1.5 ≈ 333 iUSD. If you mint 200 iUSD, your ratio is 500 ÷ 200 = 250% — a comfortable buffer.

## Why does the ratio matter?

The **minimum collateralization ratio** is a protocol parameter (e.g. 150% or higher). If your ratio falls **below** this minimum (e.g. because ADA price drops), your position becomes **under-collateralized** and can be **liquidated**:

- Part of your collateral can be used to repay your debt and keep the system solvent.
- Liquidation may involve penalties or different treatment for the liquidated user and for Stability Pool participants who “absorb” the debt.

So the ratio is your **safety margin**. Higher ratio = more room for collateral price to fall before liquidation.

## How to keep your position safe

1. **Mint conservatively** — Do not mint up to the maximum; leave a buffer (e.g. aim for 200%+ if the minimum is 150%).
2. **Monitor prices** — If your collateral (e.g. ADA) drops in price, your ratio drops. Check the app’s “liquidation price” or equivalent.
3. **Add collateral or repay debt** — Adding more collateral or burning iUSD (repaying debt) increases your ratio and reduces liquidation risk.
4. **Understand fees and incentives** — Some actions may have fees; Stability Pool participants may have incentives to liquidate under-collateralized positions. This is by design to keep the peg stable.

## Summary

- **Collateral** = assets you lock to back the iAssets you mint.
- **CDP** = your position: collateral + debt + collateralization ratio.
- **Liquidation** = when the ratio falls below the minimum; part of your collateral may be used to repay debt.
- **Best practice** = mint less than the max, monitor the ratio, and add collateral or repay debt when needed.

Next: [Using Stability Pools](stability-pools.md) — what Stability Pools are and how to join one.
