# Contributing to Indigo Hub

Thanks for your interest in contributing. This document covers how to run the docs locally and how to contribute content or code.

## Run the docs locally

1. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Serve the site**

   ```bash
   mkdocs serve
   ```

3. Open **http://127.0.0.1:8000** in your browser. The site will reload when you change files under `docs/`.

To only build (no server):

```bash
mkdocs build
```

## How to contribute

- **Content or docs:** Open an [issue](https://github.com/gorusys/indigo-hub/issues) to suggest a topic or fix, or send a [pull request](https://github.com/gorusys/indigo-hub/pulls) with your changes.
- **Code / tooling:** Same as above — open an issue to discuss, then a PR with your implementation.

Before submitting a PR, ensure `mkdocs build` passes if you changed anything under `docs/`.

## Content standards & style guide

- **Tone:** Clear, neutral, educational. Avoid promotional language.
- **Audience:** Write for the track (beginner, developer, or agents). Avoid unexplained jargon in beginner content.
- **Facts:** Align with [Indigo Protocol documentation](https://docs.indigoprotocol.io/) and cite sources where appropriate.
- **Disclaimer:** Do not give financial advice. Where relevant (e.g. risks, yields), include a short disclaimer that this is education only and not financial advice.
- **Links:** Prefer relative links within the repo (e.g. `[Setup MCP](agents/setup-mcp.md)`). Use full URLs for external sites.

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project: [CC BY-SA 4.0](LICENSE) for content and [MIT](LICENSE-CODE) for code.
