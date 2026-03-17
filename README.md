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
- **Run the docs locally:** See [Contributing](#contributing) below.

## Repository Structure

```
.
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── LICENSE
├── mkdocs.yml              # MkDocs config for the documentation site
├── docs/                   # Documentation source (Markdown)
│   ├── index.md
│   ├── beginner/           # Beginner track modules
│   └── developer/          # Developer track modules
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
- [Indigo Discord / Community](https://discord.gg/indigo) — ask questions and join education efforts

---

*This project is community-led and is not officially operated by Indigo Labs. Content is for education only; not financial advice.*
