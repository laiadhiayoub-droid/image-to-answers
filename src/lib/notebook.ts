export type NotebookBlock = { type: "markdown"; content: string } | { type: "diagram"; labels: string[]; connected: boolean };

// Only recognize explicit drawing syntax; Markdown headings, rules, lists and
// tables must retain their normal meaning.
function isDrawingLine(line: string) {
  const text = line.trim();
  return /(?:\+[-+]{2,}|[-+]{2,}\+|[┌┐└┘├┤┬┴┼│─═║])/u.test(text)
    || /^(?:[+]{3,}|[|\s+\-_/\\<>]{4,})$/.test(text)
    || /\S\s*(?:-->|->|→|←|<--|<-)\s*\S/.test(text);
}

export function diagramLabels(content: string): string[] {
  return content.split(/\r?\n|-->|->|→|←|<--|<-/u)
    .map(line => line.replace(/[+|┌┐└┘├┤┬┴┼│─═║]/gu, " ").replace(/^\s*[-_\\/<>]+|[-_\\/<>]+\s*$/g, "").trim())
    .filter(line => line && !/^[-=\s]+$/.test(line));
}

export function normalizeNoteMarkdown(text: string): string {
  const lines = text.split("\n");
  let fenced = false;
  const normalized = lines.map((line) => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return line; }
    if (fenced) return line;
    return line.replace(/^\s*[•●▪]\s*/u, "- ")
      .replace(/^\s*[.٫]([0-9٠-٩]+)\s+/u, "$1. ")
      .replace(/^\s*([0-9٠-٩]+)[.)]?\s+/u, (_, number: string) => `${number.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))}. `);
  });
  // A pipe-separated OCR table already carries explicit column boundaries.
  for (let i = 0; i < normalized.length - 1; i++) {
    if (!normalized[i].includes("|") || !normalized[i + 1].includes("|")) continue;
    if (/^\s*\|?\s*:?-+/.test(normalized[i]) || /^\s*\|?\s*:?-+/.test(normalized[i + 1])) continue;
    const columns = normalized[i].replace(/^\s*\||\|\s*$/g, "").split("|").length;
    if (columns < 2) continue;
    let end = i + 1;
    while (end < normalized.length && normalized[end].includes("|")) end++;
    normalized.splice(i + 1, 0, Array.from({ length: columns }, () => "---").join(" | "));
    i = end;
  }
  return normalized.join("\n");
}

export function parseNotebook(text: string): NotebookBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: NotebookBlock[] = [];
  let markdown: string[] = [];
  const flush = () => {
    if (markdown.length) blocks.push({ type: "markdown", content: normalizeNoteMarkdown(markdown.join("\n")) });
    markdown = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const fence = line.trim().slice(3).toLowerCase();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++]);
      const drawing = ["diagram", "ascii", "text", "plaintext", ""].includes(fence) && body.some(isDrawingLine);
      if (drawing) {
        flush();
        const source = body.join("\n");
        // Use the existing source-image branch, never reconstruct the drawing.
        blocks.push({ type: "diagram", labels: diagramLabels(source), connected: false });
      } else markdown.push(line, ...body, "```");
      continue;
    }
    // Leave GFM tables intact, including their separator rows.
    const tableLine = /^\s*\|.*\|\s*$/.test(line) && !/[+┌┐└┘│]/u.test(line);
    if (isDrawingLine(line) && !tableLine) {
      flush();
      const drawing = [line];
      while (i + 1 < lines.length && isDrawingLine(lines[i + 1])) drawing.push(lines[++i]);
      const source = drawing.join("\n");
      blocks.push({ type: "diagram", labels: diagramLabels(source), connected: false });
    } else markdown.push(line);
  }
  flush();
  return blocks;
}