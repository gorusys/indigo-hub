interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
}

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith("---")) {
    return markdown;
  }

  const endIndex = markdown.indexOf("\n---", 3);
  if (endIndex === -1) {
    return markdown;
  }

  return markdown.slice(endIndex + 4).trim();
}

export function chunkMarkdown(markdown: string, options: ChunkOptions = {}): string[] {
  const maxChars = options.maxChars ?? 2000; // ~500 tokens heuristic
  const overlapChars = options.overlapChars ?? 250;
  const cleaned = stripFrontmatter(markdown).replace(/\r\n/g, "\n").trim();

  if (!cleaned) {
    return [];
  }

  const paragraphs = cleaned.split(/\n{2,}/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    let offset = 0;
    while (offset < paragraph.length) {
      const end = Math.min(offset + maxChars, paragraph.length);
      const segment = paragraph.slice(offset, end).trim();
      if (segment) {
        chunks.push(segment);
      }
      if (end >= paragraph.length) {
        break;
      }
      offset = Math.max(end - overlapChars, 0);
    }
    current = "";
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}
