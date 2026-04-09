/**
 * Helpers for crawling docs.indigoprotocol.io (GitBook) markdown pages.
 * Live URLs use paths like /readme/using-indigo.md — not the local mkdocs layout (beginner/, developer/).
 */

export const INDIGO_DOCS_SITE = "https://docs.indigoprotocol.io";
export const INDIGO_DOCS_ENTRY = `${INDIGO_DOCS_SITE}/readme.md`;

export function normalizeDocsSiteUrl(urlString: string): string {
  const u = new URL(urlString);
  u.hash = "";
  u.search = "";
  return u.toString();
}

/**
 * Extract absolute https://docs.indigoprotocol.io/.../*.md links from GitBook markdown.
 */
export function extractMarkdownLinksToMdPages(markdown: string, pageUrl: string): string[] {
  const base = new URL(pageUrl);
  const out: string[] = [];
  const re = /\]\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    let raw = m[1].trim();
    if (!raw || raw.startsWith("#") || raw.toLowerCase().startsWith("mailto:")) continue;
    let resolved: URL;
    try {
      resolved = new URL(raw, base);
    } catch {
      continue;
    }
    if (resolved.hostname !== "docs.indigoprotocol.io") continue;
    if (resolved.pathname.startsWith("/~")) continue;
    if (!resolved.pathname.endsWith(".md")) continue;
    out.push(normalizeDocsSiteUrl(resolved.href));
  }
  return out;
}
