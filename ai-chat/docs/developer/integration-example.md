# Integration Example

This module outlines how to **integrate Indigo into a simple dApp or bot**: for example, a small web app that lets users view their CDPs and mint iUSD, or a script that monitors positions and alerts on low collateralization.

## Learning outcomes

- Plan a minimal dApp or bot that uses Indigo (read state + build transactions).
- Use the SDK in a frontend (wallet connection) or backend (RPC + keys) context.
- Apply error handling and user feedback (e.g. “transaction submitted”, “insufficient collateral”).

## Example 1: Web app - CDP dashboard and mint

**Goal:** A simple page where the user connects their wallet, sees their Indigo CDPs and collateralization ratios, and can mint more iUSD (with a form).

**Stack (conceptual):**

- Frontend: React (or vanilla JS) + wallet adapter (e.g. CIP-30 for Nami/Eternl).
- Indigo SDK in the browser: initialize with `network: 'mainnet'` and the wallet as provider.
- Flow:
  1. User clicks “Connect wallet” → request access to wallet → get address.
  2. On load (and after connect): call `sdk.getUserCdps(address)` (or equivalent) and fetch oracle prices; compute and display each CDP’s ratio and liquidation price.
  3. “Mint iUSD” form: input “additional collateral” and “amount to mint”; validate ratio locally; call `sdk.buildMintMore(...)` or open-CDP flow; sign and submit with wallet; show tx hash or error.

**Error handling:** Insufficient balance, ratio below min, user rejection, network errors — show clear messages and optionally retry for transient failures.

## Example 2: Backend script - monitor CDPs and alert

**Goal:** A Node script that periodically checks a list of addresses (or one address) for open CDPs and sends an alert (e.g. log or Telegram) when a position’s collateralization ratio falls below a threshold.

**Stack:**

- Node.js + Indigo SDK with a **backend provider** (e.g. Blockfrost, Koios) so you don’t need a wallet.
- No signing; only **read** CDPs and oracle prices (e.g. `sdk.getUserCdps` and `sdk.getOraclePrices()` or equivalent).
- Loop: every N minutes, for each address, get CDPs and prices → compute ratio → if ratio < threshold, send alert.

This is read-only and does not need private keys; you only need an RPC key and the SDK (or direct UTxO queries) to read state.

## Example 3: Arbitrage or trading bot (advanced)

**Goal:** A bot that compares iUSD price on a DEX vs 1 USD and, when there’s a premium or discount, mints/burns or buys/sells to capture the spread. This is advanced and carries financial and technical risk.

**Considerations:**

- Read DEX prices (via DEX API or on-chain) and Indigo oracle/CDP state.
- Build mint/repay or swap transactions; sign with a hot wallet (or secure signer). Prefer testnet first.
- Handle slippage, front-running, and fees; add circuit breakers and limits.

We do not provide full bot code here; the point is that the same SDK and query patterns (state + build tx + sign + submit) apply.

## Best practices

- **Security:** Never expose private keys in frontend; use wallet for signing in dApps. In bots, use minimal funds and secure key management.
- **UX:** Show loading states, tx hash link (block explorer), and clear errors. For irreversible actions (mint, repay), confirm with the user.
- **Testing:** Prefer testnet and small amounts; add unit tests for ratio math and mock SDK where possible.
- **Docs:** Keep your integration in sync with Indigo’s SDK and contract updates; watch for deprecations and new endpoints.

## Summary

- **dApp:** Wallet connect + SDK (wallet as provider) → read CDPs and prices → build/sign/submit mint or repay with good error handling and UX.
- **Monitor script:** Backend SDK with RPC provider → read-only CDP and price checks → alert when ratio below threshold.
- **Advanced bots:** Same building blocks (read state, build tx, sign, submit); add DEX data, risk controls, and testnet validation.

Next: [Testing and Deployment](testing-deployment.md) — testnet usage, testing strategies, and deployment tips.
