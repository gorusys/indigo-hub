# Indigo Architecture

This module gives a **technical overview** of the Indigo Protocol: how it is built on Cardano, what roles Plutus contracts play, and how iAssets are implemented (e.g. in Indigo V2).

## Learning outcomes

- Describe Indigo’s high-level architecture on Cardano.
- Identify the main contract types (CDPs, minters, oracles).
- Understand how iAssets are created and maintained on-chain.

## Cardano and eUTxO

Indigo runs on **Cardano**, which uses the **eUTxO** (extended Unspent Transaction Output) model. In eUTxO:

- The ledger is a set of **unspent outputs**, each carrying value (ADA and/or native tokens) and optional **datum** (state) and **script** (validation logic).
- A **transaction** consumes one or more outputs and creates new outputs. Validators (Plutus scripts) run on the consumed outputs and must succeed for the transaction to be valid.
- There are no global mutable “contract state” variables; state is encoded in **datum** on UTxOs at script addresses.

So Indigo’s “state” (e.g. open CDPs, minted iAssets) is represented by **UTxOs** at specific **script addresses** with specific **datums**. The [Plutus & eUTxO Primer](plutus-eutxo.md) goes deeper.

## Indigo V2 protocol components

Indigo’s documentation describes a **V2** protocol with components such as:

- **CDP (Collateralized Debt Position) contracts** — Lock collateral and mint (or burn) iAssets. Datum on CDP UTxOs typically encodes: collateral amount, debt (minted iAsset), owner, and parameters.
- **Minter / iAsset contracts** — Control the minting and burning of iAsset tokens. Only authorized scripts (e.g. the CDP logic) can mint or burn.
- **Oracle integration** — Price feeds are consumed by the protocol to value collateral and to determine liquidation and redemption conditions. Oracles are usually separate scripts or inputs that provide price data.
- **Stability Pool contracts** — Hold pooled iAssets and interact with liquidations (e.g. provide iUSD to cancel debt and receive collateral).
- **Governance** — Parameter updates or upgrades may be gated by governance scripts or multisig.

Exact script names and structure follow [Indigo’s official docs](https://docs.indigoprotocol.io/); the above is a conceptual map.

## How iAssets are implemented

- **iAssets** (iUSD, iBTC, iETH) are **Cardano native assets** (policy ID + asset name). The **policy** is controlled by Plutus scripts so that only the protocol logic can mint or burn.
- **Minting**: When you open a CDP or add debt, the CDP validator (or associated minter) mints the corresponding iAsset to your address.
- **Burning**: When you repay debt or when liquidations use Stability Pool iUSD, the script burns that iAsset.
- **Oracles** supply the price data that validators use to check collateralization and liquidation.

So the flow is: **user transaction → consumes CDP/oracle UTxOs and maybe Stability Pool UTxOs → runs Plutus validators → creates new UTxOs (updated CDP, minted/burned iAssets)**.

## Why this matters for developers

- To interact with Indigo from code, you need to **build transactions** that consume and create the right UTxOs with the right datums and redeemer values.
- The **Indigo TypeScript SDK** abstracts much of this: it knows the contract addresses, parameter formats, and typical flows (open CDP, mint, repay, liquidate). You call SDK methods and the SDK builds the transaction.
- For custom integrations or debugging, understanding **which script does what** and **what datum/redeemer** each expects is essential. The SDK source and Indigo’s protocol docs are the references.

## Summary

- Indigo runs on **Cardano** in the **eUTxO** model; state lives in **UTxOs** and **datums** at script addresses.
- Main components: **CDP contracts**, **minter/iAsset contracts**, **oracle integration**, **Stability Pools**, and **governance**.
- **iAssets** are native assets whose mint/burn policy is controlled by Plutus; the SDK helps you build valid transactions without hand-coding every UTxO.

Next: [Plutus & eUTxO Primer](plutus-eutxo.md) — core concepts for reading and debugging Indigo transactions.
