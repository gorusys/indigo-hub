# Introduction to Cardano & DeFi

This module gives you the background you need to understand Indigo: what blockchain and DeFi are, and why synthetic assets matter on Cardano.

## Learning outcomes

- Explain at a high level what blockchain and DeFi are.
- Understand why Cardano is a relevant platform for DeFi.
- See where synthetic assets (and Indigo) fit in the DeFi landscape.

## What is blockchain?

A **blockchain** is a shared ledger that many participants maintain without a single central authority. Transactions are grouped into blocks, validated by consensus, and chained together so that past data is hard to alter. This enables:

- **Transparency** — Anyone can verify the history of transactions.
- **Censorship resistance** — No single party can easily block or reverse valid transfers.
- **Programmable money** — Rules can be encoded in smart contracts that execute when conditions are met.

Cardano is a proof-of-stake blockchain with its own native currency (ADA) and a smart-contract layer (Plutus) that runs on the **eUTxO** model (extended Unspent Transaction Output). We will not go deep into eUTxO here; the [Developer track](../developer/plutus-eutxo.md) covers it.

## What is DeFi?

**DeFi** (Decentralized Finance) refers to financial services built on blockchains: lending, borrowing, trading, and creating synthetic or derivative assets — without relying on a traditional bank or broker. Users connect with **wallets** (e.g. Nami, Eternl, Lace) and interact with smart contracts through web apps.

On Cardano, DeFi includes:

- **DEXs** (Decentralized Exchanges) — Swap tokens peer-to-peer via liquidity pools.
- **Lending and borrowing** — Use collateral to borrow assets or earn yield.
- **Synthetic assets** — Tokens that track the price of another asset (e.g. a stablecoin tracking the US dollar).

Indigo fits in the last category: it lets you create and use **synthetic assets** (iAssets) on Cardano, backed by collateral and maintained by protocol mechanics (e.g. Stability Pools, liquidations).

## Why Cardano?

Cardano aims for security, sustainability, and formal methods in smart contracts. For users and developers, that means:

- A clear separation between the settlement layer and the computation layer (Plutus).
- Active development and a growing DeFi ecosystem (DEXs, stablecoins, liquid staking).
- A focus on interoperability and long-term upgrades.

Indigo is built **on** Cardano: it uses Cardano’s native assets and Plutus contracts to issue iAssets (e.g. iUSD, iBTC, iETH) that track real-world prices via oracles.

## Where Indigo fits

Indigo is a **synthetic assets protocol** on Cardano. It allows users to:

- Lock **collateral** (e.g. ADA) in a **Collateralized Debt Position (CDP)**.
- **Mint** iAssets (e.g. iUSD) against that collateral.
- Use iAssets in the broader Cardano ecosystem (e.g. trade on DEXs, provide liquidity).
- Participate in **Stability Pools** and **governance** (INDY token).

So in one sentence: **Indigo lets you create Cardano-native tokens that mirror the value of real assets (like the US dollar or Bitcoin), using over-collateralization and protocol incentives to keep those pegs stable.**

## Summary

- **Blockchain** = shared, verifiable ledger; **DeFi** = financial applications on top of it.
- **Cardano** = proof-of-stake chain with Plutus smart contracts and a growing DeFi ecosystem.
- **Indigo** = synthetic assets protocol on Cardano: mint and use iAssets (e.g. iUSD) with collateral and Stability Pools.

Next: [What is a Synthetic Asset?](synthetic-assets.md) — we zoom in on iAssets and how they work.
