# Advanced Contract Interaction

This module covers **advanced** topics: how **liquidations** work at the transaction level, **querying CDP state** on-chain, and **error modes** (e.g. under-collateralization) when integrating with Indigo.

## Learning outcomes

- Describe how a liquidation transaction consumes CDP and Stability Pool UTxOs.
- Query on-chain state (CDPs, oracle prices) for a given address or script.
- Handle under-collateralization and other failure modes in your integration.

## Liquidation flow (conceptual)

When a CDP’s collateralization ratio falls below the protocol minimum:

1. **Liquidators** (or the protocol/Stability Pool) can submit a transaction that:
   - Consumes the **under-collateralized CDP** UTxO (with a “Liquidate” redeemer).
   - Consumes **Stability Pool** UTxO(s) that hold iUSD.
   - Uses iUSD from the pool to “repay” (burn) the CDP’s debt.
   - Transfers (part of) the **collateral** to the Stability Pool or to liquidators, according to protocol rules.
2. The CDP owner’s position is fully or partially closed; they may receive back less collateral (or none) depending on parameters and penalties.

The exact flow (who can trigger, how much collateral goes where, and how the redeemer is structured) is defined by Indigo’s Plutus validators. The TypeScript SDK may expose a **liquidate** or **triggerLiquidation** helper that builds this transaction; otherwise you need to construct it from the contract spec.

## Querying CDP state on-chain

To show a user their positions or to decide when to liquidate, you need **on-chain state**:

- **By script address:** Query all UTxOs at the CDP script address. Filter by **datum**: decode the datum to get owner, collateral, debt, and compute ratio using oracle prices.
- **By owner:** If the CDP UTxO is at an address derived from the owner’s key (e.g. collateral output to owner), you can query by address; otherwise you rely on datum ownership fields and filter CDP UTxOs.
- **Oracle prices:** Query the oracle script address for the latest price UTxO(s); decode the datum to get the current price for each asset.

Tools:

- **Blockfrost / Koios / other RPC:** “Get UTxOs at address” and “Get UTxO by tx hash + index”. Then decode datum (CBOR/CIP-32 or Plutus Data) in your code.
- **Indigo SDK:** If it provides `getUserCdps`, `getOraclePrices`, or similar, use those so you don’t have to hand-parse datums.

You can cache oracle and CDP data and refresh on block or on user action, depending on your UX and accuracy needs.

## Under-collateralization and other errors

- **Mint / open CDP fails:** User may try to mint more than the allowed amount for their collateral, or the ratio would be below minimum. The validator will fail. In your app: validate ratio and max mint on your side before building the tx; show a clear error (“Insufficient collateral” or “Would be under-collateralized”).
- **Liquidation:** If the user’s position is liquidated, their CDP UTxO disappears (consumed by a liquidation tx). Your UI should stop showing that position and explain that it was liquidated.
- **Oracle staleness:** If the oracle datum is old or missing, the protocol might reject transactions that depend on it. Handle “oracle not found” or “stale price” in your logic and, if possible, avoid building txs when prices are outdated.
- **Slippage and front-running:** In volatile markets, the price can move between building and confirmation. Consider displaying a warning or using conservative estimates.

## Summary

- **Liquidation** = transaction that consumes under-collateralized CDP + Stability Pool UTxOs, burns iUSD, and reallocates collateral; SDK or contract spec defines the exact build.
- **Querying state** = fetch UTxOs at CDP and oracle addresses, decode datums to get positions and prices; use SDK helpers when available.
- **Error handling** = validate ratios and amounts before building; handle validator failure, liquidation, and oracle issues in your integration.

Next: [Integration Example](integration-example.md) — build a simple dApp or bot that uses Indigo.
