#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== MkDocs (docs + chat embed hook) =="
mkdocs build --strict

echo "== Next.js (ai-chat) =="
cd "$ROOT/ai-chat"
npm ci
npm run build

echo "OK: indigo-hub docs + ai-chat build successfully."
