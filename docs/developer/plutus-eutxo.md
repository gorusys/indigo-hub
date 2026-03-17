# Plutus & eUTxO Primer

This module introduces **Cardano’s eUTxO model** and **Plutus** basics so you can understand how Indigo’s contracts work and how the TypeScript SDK builds transactions.

## Learning outcomes

- Explain the eUTxO model (outputs, consumption, no global state).
- Describe what a Plutus validator does (datum, redeemer, context).
- Relate these concepts to Indigo (CDP UTxOs, script addresses).

## The eUTxO model

On Cardano, the ledger is a set of **Unspent Transaction Outputs (UTxOs)**. Each UTxO has:

- **Address** — Where it sits (either a key-based address or a **script address**).
- **Value** — ADA and/or native tokens (e.g. iUSD).
- **Datum** (optional) — A piece of data attached to the output; scripts can read it.
- **Reference script** (optional) — Script that will validate future consumption of this or other outputs.

A **transaction**:

1. **Consumes** one or more existing UTxOs (they are “inputs”).
2. **Produces** one or more new UTxOs (they are “outputs”).
3. For each consumed UTxO at a **script address**, the corresponding **validator** runs. It receives the **datum** of the consumed output, a **redeemer** from the transaction, and the **transaction context** (inputs, outputs, etc.). If any validator fails, the transaction is invalid.

There is **no global mutable state**. All “state” is the current set of UTxOs and their datums. To “update” contract state, you consume the old UTxO(s) and create new one(s) with updated datums.

## Plutus validators

A **Plutus validator** is a function that takes:

- **Datum** — State stored on the UTxO being consumed.
- **Redeemer** — User-/script-chosen data for this consumption (e.g. “mint 100 iUSD”).
- **Context** — The full transaction (inputs, outputs, signatures, etc.).

The validator returns **True** (accept) or **False** (reject). So every interaction with a contract is: “I am consuming this UTxO with this redeemer; here is the whole transaction; is it allowed?”

Validators are written in **Haskell** (or generated from other specs) and compiled to Plutus Core. As a TypeScript developer you usually do not write validators; you use the **Indigo SDK** to build transactions that satisfy the existing Indigo validators.

## How this maps to Indigo

- **CDP position** = one (or more) UTxO(s) at the CDP script address. The **datum** might encode: owner, collateral amount, debt (iAsset amount), and parameters. To “mint more” or “repay”, you build a transaction that **consumes** that CDP UTxO with a **redeemer** describing the action, and **produces** a new CDP UTxO with updated datum and possibly new iAsset minted/burned.
- **Stability Pool** = UTxOs at the pool script address; datum might encode total deposited iUSD and per-user shares. Deposits and withdrawals are transactions that consume and create these UTxOs with the right redeemers.
- **Oracles** = UTxOs that carry price data in their datum. Other scripts (e.g. CDP validator) reference these as inputs so they can read current prices.

So when you use the Indigo SDK to “mint iUSD”, under the hood it is building a transaction that: consumes your CDP UTxO (and oracle UTxOs), uses a redeemer like “Mint 100 iUSD”, and produces an updated CDP UTxO plus minted iUSD at your address — all in line with the Plutus validators’ rules.

## Summary

- **eUTxO** = ledger is a set of outputs; transactions consume and create them; no global state.
- **Plutus validator** = datum + redeemer + context → True/False; state lives in datums on UTxOs.
- **Indigo** uses script addresses for CDPs, minters, Stability Pools, and oracles; the SDK builds the right consumption and production of UTxOs.

Next: [Indigo TypeScript SDK](sdk-setup.md) — install the SDK and perform basic CDP operations from code.
