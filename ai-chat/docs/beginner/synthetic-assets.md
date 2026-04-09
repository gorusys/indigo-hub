# What is a Synthetic Asset?

This module explains **synthetic assets** and how Indigo’s **iAssets** (e.g. iUSD, iBTC, iETH) work on Cardano.

## Learning outcomes

- Define a synthetic asset and give examples.
- Explain how iAssets mirror real-world assets.
- Understand at a high level why over-collateralization is used.

## Synthetic assets in brief

A **synthetic asset** is a token whose value is designed to track another asset (e.g. the US dollar, Bitcoin, or gold) without you actually holding that asset. You get **price exposure** through the protocol’s design and incentives, not through custody of the underlying.

Examples in traditional finance include certain derivatives and ETFs. In crypto, **stablecoins** are a common form: a token that aims to stay around 1 USD. Indigo’s **iUSD** is a Cardano-native synthetic stablecoin; **iBTC** and **iETH** track Bitcoin and Ethereum prices.

## How do iAssets work?

Indigo’s iAssets are **Cardano native tokens** created by the protocol. Their value is pegged to external assets (e.g. USD, BTC, ETH) through:

1. **Collateral** — Users lock more value (e.g. ADA) than the iAssets they mint. This “over-collateralization” backs the system.
2. **Oracles** — Prices are fed on-chain so the protocol knows the value of collateral and the target assets.
3. **Stability mechanisms** — Stability Pools and liquidations help keep the peg. If a position becomes under-collateralized, it can be liquidated; Stability Pool participants can earn rewards by absorbing that risk.
4. **Redemptions** — In certain conditions, iAssets can be redeemed for collateral according to protocol rules, which helps keep the peg.

So when you hold **iUSD**, you hold a Cardano token that is designed to track the US dollar, backed by collateral and protocol logic — not by a bank account or a 1:1 reserve of dollars.

## Why over-collateralization?

Blockchain collateral can be volatile. To reduce the chance that the system becomes under-backed, Indigo requires users to lock **more** collateral than the value of the iAssets they mint. For example, you might lock 150 ADA worth of value to mint 50 USD worth of iUSD. The extra buffer helps absorb price moves before a position is liquidated. The exact ratio is set by protocol parameters (e.g. minimum collateralization ratio).

## Key terms

| Term | Meaning |
|------|--------|
| **iAsset** | Indigo synthetic asset (e.g. iUSD, iBTC, iETH). |
| **iUSD** | Indigo’s synthetic US dollar-pegged stablecoin. |
| **Over-collateralization** | Locking more collateral than the value of minted iAssets. |
| **Peg** | The target price (e.g. 1 iUSD ≈ 1 USD). |

## Summary

- **Synthetic assets** = tokens that track the price of another asset without holding it.
- **iAssets** = Indigo’s Cardano-native synthetics (iUSD, iBTC, iETH), backed by collateral and oracles.
- **Over-collateralization** helps keep the system solvent when collateral prices move.

Next: [Getting Started with Indigo](using-indigo.md) — connect your wallet and use the Indigo app.
