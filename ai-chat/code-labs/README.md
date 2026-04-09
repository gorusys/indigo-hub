# Code labs

Hands-on code examples and notebooks for the Indigo Protocol Education Initiative.

## Contents

- **mint-iusd/** — Example script (TypeScript) for minting iUSD using the Indigo SDK. See [Code Lab - Mint iUSD](../docs/developer/code-lab-mint-iusd.md) in the docs.
- **notebooks/** — (Optional) Jupyter notebooks for CDP lifecycle or Plutus concepts; can be run on Binder.

## Running the mint-iusd example

```bash
cd mint-iusd
npm install
# Set NETWORK and provider (e.g. testnet); then:
npx ts-node mint-iusd.ts
```

Use testnet and small amounts when learning. See the [developer docs](../docs/developer/code-lab-mint-iusd.md) for full instructions.

## License

Code in this directory is under [MIT](../LICENSE-CODE).
