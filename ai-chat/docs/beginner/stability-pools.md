# Using Stability Pools

This module explains **Stability Pools** on Indigo: what they are, why they exist, and how you can participate.

## Learning outcomes

- Explain the role of Stability Pools in the protocol.
- Describe how you can deposit iAssets into a Stability Pool.
- Understand the trade-offs (rewards vs. liquidation risk).

## What is a Stability Pool?

A **Stability Pool** is a pool of iAssets (e.g. iUSD) that the protocol uses when CDPs are **liquidated**. When a position becomes under-collateralized:

- The protocol uses iUSD from the Stability Pool to “repay” (cancel) the liquidated debt.
- In exchange, the protocol typically transfers (part of) the liquidated collateral to the Stability Pool or to the pool participants.

So Stability Pool participants provide **liquidity** that helps the system absorb bad debt and keep the iUSD peg stable. In return, they can earn **rewards** (e.g. from liquidated collateral or protocol incentives).

## Why do Stability Pools exist?

- **Peg stability** — Liquidations need a source of iUSD to burn against bad debt. Stability Pools provide that.
- **Incentives** — Users who deposit iUSD into the pool take on the risk of being “first in line” when liquidations happen; the protocol compensates them with rewards (e.g. collateral from liquidated CDPs or INDY incentives).
- **Decentralization** — The stability mechanism does not rely on a single party; it is rule-based and on-chain.

## How to join a Stability Pool

1. **Have iUSD** — You need iUSD (or the relevant iAsset for that pool). You can mint it via a CDP or acquire it on a DEX.
2. **Open the Indigo app** — Find the **Stability Pool** or **Stake iUSD** section.
3. **Deposit** — Choose how much iUSD to deposit into the pool. Confirm and sign the transaction.
4. **Track your position** — The app will show your share of the pool and any accrued rewards. You may need to claim or compound rewards separately.

Details (e.g. reward token, APY, claim flow) can change; always check the current Indigo app and docs.

## Risks and rewards

| Pros | Cons |
|------|------|
| Earn rewards (e.g. liquidated collateral, INDY). | Your deposited iUSD is used in liquidations — when a CDP is liquidated, your share of the pool can decrease (you receive collateral instead). |
| Help secure the peg. | Protocol and smart contract risk. |
| No need to manage a CDP. | Reward rates and liquidation frequency can vary. |

So joining a Stability Pool is a way to earn yield while taking on liquidation-related risk. Only deposit what you understand and can afford to lose.

## Summary

- **Stability Pools** hold iUSD (or other iAssets) used when CDPs are liquidated.
- **Participants** deposit iAssets and can earn rewards (e.g. liquidated collateral, INDY).
- **Trade-off**: you help stabilize the peg and earn, but your deposit is used in liquidations — understand the mechanics and risks before participating.

Next: [Staking INDY & Governance](staking-governance.md) — how INDY token and community governance work.
