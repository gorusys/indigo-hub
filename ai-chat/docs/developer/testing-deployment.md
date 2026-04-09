# Testing and Deployment

This module covers **testing** Indigo integrations (testnet, unit tests, and strategies) and **deployment** tips for scripts and dApps.

## Learning outcomes

- Use Cardano **testnet** (e.g. preprod) for Indigo development and testing.
- Apply testing strategies: ratio logic, mocked SDK, and dry runs.
- Deploy a dApp or script to production with sensible security and monitoring.

## Testnet

- **Preprod** and **Preview** are Cardano testnets. Indigo may deploy test contracts there; check [Indigo docs](https://docs.indigoprotocol.io/) for testnet app URLs and contract addresses.
- **Get test ADA** from a faucet (e.g. Cardano testnet faucet) so you can pay fees and (if supported) use test collateral.
- **Configure** your SDK and wallet for the same network (e.g. `network: 'preprod'`). Use a testnet wallet; do not use mainnet keys on testnet in production tooling.
- **Run through** full flows: connect wallet, open CDP, mint, repay, close, and (if available) trigger or observe a liquidation. This validates end-to-end behavior before mainnet.

## Testing strategies

- **Ratio and math:** Unit test your collateralization ratio and “max mint” calculations with fixed prices and amounts. Ensure you don’t suggest a mint that would put the position below the minimum ratio.
- **Mock SDK:** In CI or unit tests, mock the Indigo SDK (e.g. return fake CDPs and prices) so you can test your UI or bot logic without hitting the chain.
- **Dry run:** When building transactions, do a “build + sign” without submit first. Inspect the transaction or run it on testnet to confirm structure and fees.
- **Integration tests:** Optional: automated tests that run against testnet (e.g. “open CDP, mint, repay, close”) with a dedicated test wallet. Be aware of testnet instability and latency.

## Deployment

### Frontend dApp

- **Hosting:** Use static hosting (e.g. GitHub Pages, Netlify, Vercel) or your preferred frontend host. Build the app (e.g. `npm run build`) and deploy the build output.
- **Environment:** Use env vars for app config (e.g. `NEXT_PUBLIC_NETWORK=mainnet`). Do not hardcode mainnet vs testnet in source if you want to support both.
- **Wallet connection:** Ensure your wallet adapter supports the wallets you care about (Nami, Eternl, Lace, etc.) and that you’re using the official wallet injection (no custom keys in frontend).
- **Links:** Point users to the **official** Indigo app and docs; if your app is a third-party tool, state that clearly and link to Indigo’s security/brand guidelines if applicable.

### Backend script or bot

- **Secrets:** Store RPC keys and (if needed) signing keys in a secrets manager or env, never in code or public repos.
- **Network:** Run against mainnet only when you’re ready; use testnet for staging. Consider rate limits and RPC quotas when polling often.
- **Monitoring:** Log errors, failed txs, and (for bots) balance and position state. Set up alerts for repeated failures or unexpected state.
- **Upgrades:** Track Indigo SDK and contract updates; test upgrades on testnet and roll out with a clear rollback plan.

## Summary

- **Testnet** (preprod/preview) for development and end-to-end testing; get test ADA and use testnet config.
- **Testing:** Unit test ratio/math, mock SDK where useful, dry-run or testnet for full flows.
- **Deploy:** Static host for dApps with env config and safe wallet usage; secure secrets and monitoring for backend scripts/bots.

You have completed the **Developer track**. For a recap, see the [Developer index](index.md). For beginner material, see the [Beginner track](../beginner/index.md).
