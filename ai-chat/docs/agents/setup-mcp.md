# Setup Indigo MCP

This guide walks you through connecting an **MCP-compatible AI client** (e.g. Claude Desktop, Cursor, Windsurf, OpenClaw) to Indigo Protocol using the official [Indigo MCP](https://github.com/IndigoProtocol/indigo-mcp) server.

## Prerequisites

- **Node.js** (e.g. 18+) and `npx`
- An **MCP client** (Cursor, Claude Desktop, Windsurf, VS Code with MCP extension, etc.)
- **Blockfrost API key** (recommended for full functionality) — get one at [blockfrost.io](https://blockfrost.io/)

## Quick install

Choose what you need:

| Package | Purpose | Command |
|---------|---------|---------|
| **indigo-mcp** | 57 tools for Indigo Protocol (loans, pools, governance, staking) | `npx @indigo-protocol/indigo-mcp` |
| **cardano-mcp** | 6 tools for Cardano (chain, DEX, etc.) | `npx @indigo-protocol/cardano-mcp` |
| **indigo-skills** | All 13 skills bundle (e.g. for OpenClaw) | `npx @indigoprotocol/indigo-skills` |

### One-command setup

Run the setup wizard so the MCP server is configured for your client:

```bash
npx @indigo-protocol/indigo-mcp setup
```

The wizard will:

1. Let you select your MCP client (Claude, Cursor, etc.)
2. Prompt for your Blockfrost API key (optional but recommended)
3. Write the correct config so your client can connect

Then **restart your AI client** and try a natural-language query, e.g.:

- *"What is the current Indigo Protocol TVL?"*
- *"Show me my loan positions and their health status"*

## Access methods

- **MCP server** — Full 57-tool access via Model Context Protocol. Best for Claude, Cursor, Windsurf, VS Code.
- **Skills** — Same tools packaged as skills for agents like OpenClaw. Install with `npx @indigoprotocol/indigo-skills`.

Details and client-specific steps: [Indigo Agents → Setup MCP](https://agents.indigoprotocol.io/setup).

## Security and data

- Indigo MCP runs **locally** on your machine.
- API keys are stored in **local config** and are not sent to external servers.
- For **write operations** (e.g. open/close loans), you choose which wallet is connected and approve each transaction.
- The stack is **open source** — you can audit it on [GitHub](https://github.com/IndigoProtocol/indigo-mcp).

## FAQ

- **Do I need a Blockfrost key?** Recommended for on-chain reads and writes. Some read-only tools (e.g. indexer-based queries) work without it.
- **Which clients are supported?** Any client that implements the [Model Context Protocol](https://modelcontextprotocol.io/), including Claude Desktop, Claude Code, Cursor, Windsurf, OpenClaw, and VS Code with an MCP extension.
- **Can I manage real loans?** Yes. Start in read-only mode to get familiar, then connect a wallet. Always verify transactions before signing and test with small amounts first.

For more FAQs and the latest info, see the [Indigo Agents Portal](https://agents.indigoprotocol.io/).
