# Indigo Protocol Education Initiative

Open-source educational materials for the [Indigo Protocol](https://indigoprotocol.io/) — a Cardano-based synthetic assets platform. Learn about iAssets (e.g. iUSD, iBTC, iETH), CDPs, Stability Pools, and how to build with Indigo.

## Goals

- **Educate** users about Indigo's purpose and mechanics (on-chain synthetic assets)
- **Foster developer adoption** with clear guides and code labs
- **Build an engaged community** of contributors and learners

## Who Is This For?

| Audience | What you'll learn |
|----------|-------------------|
| **Novice** | What synthetic assets are, how to use the Indigo app, mint iUSD, manage a CDP |
| **Developer** | Indigo architecture, Plutus/eUTxO basics, TypeScript SDK, code labs |
| **Researcher** | Protocol design, tokenomics, governance, stability mechanisms |

## Quick Start

- **New to Indigo?** Start with [Indigo Fundamentals](docs/beginner/intro.md) and [Getting Started with Indigo](docs/beginner/using-indigo.md).
- **Building on Indigo?** Go to the [Developer Track](docs/developer/arch-overview.md) and [Indigo TypeScript SDK](docs/developer/sdk-setup.md).
- **Run the docs locally:** See [Contributing](CONTRIBUTING.md#run-the-docs-locally) below.

## Repository Structure

```
.
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── mkdocs.yml              # MkDocs config for the documentation site
├── docs/                   # Documentation source (Markdown)
│   ├── index.md
│   ├── beginner/           # Beginner track modules
│   ├── developer/          # Developer track modules
│   └── agents/             # Indigo Agents, MCP setup, repos & SDK
├── content/                # Drafts, transcripts, working files
├── code-labs/              # Jupyter notebooks and TypeScript examples
├── images/                 # Diagrams and illustrations
├── videos/                 # Tutorial recordings or links
└── .github/
    ├── workflows/          # CI/CD (build, link check)
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

## Licensing

- **Educational content** (docs, articles, images, videos): [CC BY-SA 4.0](LICENSE) — free to use and adapt with attribution; derivatives must be shared under the same license.
- **Code** (scripts, notebooks, tooling): [MIT](LICENSE-CODE) — permissive reuse.

See [LICENSE](LICENSE) and [LICENSE-CODE](LICENSE-CODE) for full text.

## Links

- [Indigo Protocol](https://indigoprotocol.io/)
- [Indigo Documentation](https://docs.indigoprotocol.io/)
- [Indigo Agents Portal](https://agents.indigoprotocol.io/) — AI tools, MCP setup, and SDK integrations
- [Indigo Discord / Community](https://discord.gg/indigo) — ask questions and join education efforts

---

*This project is community-led and is not officially operated by Indigo Labs. Content is for education only; not financial advice.*

---

## IndigoAI RAG Chatbot (this Next.js app)

This repository also includes an AI “chat over docs” widget built with **Next.js**, **OpenAI**, and **Supabase pgvector**.

### What gets ingested

**Recommended:** `npm run embed` crawls **[docs.indigoprotocol.io](https://docs.indigoprotocol.io/)** (GitBook) starting from `/readme.md`, follows internal `*.md` links under `/readme/…`, and stores **`canonicalUrl`** on every chunk so **Sources** links match the live site (no guessed paths / 404s).

**Optional:** `npm run embed:local` embeds **all `.md` files under `./docs/`** (MkDocs-style Indigo Hub repo layout). That corpus does **not** match GitBook URL paths; use the site embed for correct citations.

### Supabase objects (Indigo-only)

This app uses isolated vector storage so Indigo embeddings don’t mix with any other corpus:

- Table: `public.indigo_docs_embeddings`
- RPC: `public.match_indigo_docs_embeddings`

### Setup

1. Install dependencies:
   - `npm install`
2. Configure environment variables:
   - Copy `.env.local.example` to `.env.local` and fill in:
     - `OPENAI_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
3. Run the Supabase SQL:
   - Execute everything in `sql/schema.sql` in the Supabase SQL editor.
4. (Recommended) Fix IVFFlat indexing after ingestion:
   - Execute `sql/fix_ivfflat.sql` once after your first successful embed.
5. Embed docs into Supabase:
   - `npm run embed` (live docs site — recommended)
   - or `npm run embed:local` (local `./docs/` only)
6. Start the app:
   - `npm run dev`
   - Open `http://localhost:3000`

### “Sources” links / citations

When the assistant answers with retrieved docs, it appends a **Sources** block.
After a **site embed**, each chunk has `metadata.canonicalUrl` pointing at the exact GitBook page (e.g. `https://docs.indigoprotocol.io/readme/using-indigo`).
If you only ran **`embed:local`**, citations fall back to path-based URLs and may **404** because GitBook paths (`/readme/...`) differ from MkDocs paths (`/beginner/...`).
