# Risks and Best Practices

This module summarizes **risks** when using Indigo and **best practices** to stay safer. It also includes important **disclaimers**.

## Learning outcomes

- List main risks (liquidation, slippage, smart contract, etc.).
- Apply practical steps to reduce risk.
- Understand why “not financial advice” and “do your own research” matter.

## Important disclaimer

!!! danger "Not financial or legal advice"
    This content is for **educational purposes only**. It does not constitute financial, investment, tax, or legal advice. Indigo and crypto assets involve significant risk. Always do your own research and consider consulting a qualified professional before making financial decisions. Never invest more than you can afford to lose.

## Main risks

### 1. Liquidation risk

If your CDP’s collateralization ratio falls below the protocol minimum (e.g. because collateral price drops), your position can be **liquidated**. You may lose part or all of your collateral depending on protocol rules.

**Mitigation:** Mint conservatively, keep a buffer above the minimum ratio, monitor your liquidation price, and add collateral or repay debt when needed.

### 2. Volatility and slippage

Collateral (e.g. ADA) and iAssets can be volatile. When you swap iUSD on a DEX or when liquidations occur, **slippage** (difference between expected and executed price) can be significant, especially in large or illiquid markets.

**Mitigation:** Use limit orders or smaller sizes where possible; check expected output before confirming trades.

### 3. Smart contract and protocol risk

Indigo relies on **smart contracts** and **oracles**. Bugs, exploits, or incorrect oracle data could lead to loss of funds. Protocol parameters can also change via governance.

**Mitigation:** Use only official Indigo interfaces; verify contract addresses; understand that code and parameters can be upgraded.

### 4. Counterparty and custody

You are responsible for your **wallet** and keys. If you lose access or someone gains access, funds can be lost. Third-party custodians (if you use them) have their own risks.

**Mitigation:** Secure your seed phrase; use hardware wallets for large amounts; be wary of phishing sites and fake links.

### 5. Regulatory and tax

Regulation of stablecoins and synthetic assets is evolving. Tax treatment of minting, swapping, staking, and rewards varies by jurisdiction.

**Mitigation:** Comply with local laws; consider professional tax advice.

## Best practices

| Do | Avoid |
|----|--------|
| Use official Indigo links only; bookmark the app. | Clicking random links from social media or DMs. |
| Start with small amounts when learning. | Putting in more than you can afford to lose. |
| Monitor your CDP ratio and liquidation price. | Minting up to the maximum and forgetting. |
| Keep a safety buffer above the minimum ratio. | Ignoring market moves when you have an open CDP. |
| Secure your wallet and seed phrase. | Sharing keys or storing seeds in plain text online. |
| Read the docs and understand liquidation and Stability Pools. | Relying only on third-party summaries. |

## Summary

- **Risks** include liquidation, volatility, slippage, smart contract/oracle risk, custody, and regulation.
- **Best practices**: use official links, small sizes, monitor your CDP, secure your wallet, and do your own research.
- **Disclaimer**: This is education, not financial or legal advice; you are responsible for your own decisions.

You have completed the **Beginner track**. To go deeper technically, see the [Developer track](../developer/index.md). To recap, use the [Beginner index](index.md).
