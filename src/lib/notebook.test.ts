import { describe, expect, it } from "vitest";
import { parseNotebook } from "./notebook";

describe("notebook content parsing", () => {
  it("preserves headings, ordered steps, bullets, line breaks and Markdown tables", () => {
    const text = "# الفيزياء\n## الطاقة\n1. تعريف\n2. مثال\n- ملاحظة\n\n| الكمية | القيمة |\n| --- | --- |\n| السرعة | 20 |";
    expect(parseNotebook(text)).toEqual([{ type: "markdown", content: text }]);
  });
  it("routes explicit arrows to the original-image block instead of reconstructed nodes", () => {
    expect(parseNotebook("الضوء -> العدسة -> الصورة")).toEqual([{ type: "diagram", labels: ["الضوء", "العدسة", "الصورة"], connected: false }]);
  });
  it("keeps the original-image block at the diagram position between text sections", () => {
    expect(parseNotebook("# التجربة\nالنص قبل الرسم\nالضوء -> العدسة\nالنص بعد الرسم")).toEqual([
      { type: "markdown", content: "# التجربة\nالنص قبل الرسم" },
      { type: "diagram", labels: ["الضوء", "العدسة"], connected: false },
      { type: "markdown", content: "النص بعد الرسم" },
    ]);
  });
  it("uses the source-image branch for fenced diagrams too", () => {
    expect(parseNotebook("```diagram\na -> b\n```")).toEqual([{ type: "diagram", labels: ["a", "b"], connected: false }]);
  });
  it("removes ASCII drawing borders without inventing connections", () => {
    expect(parseNotebook("```ascii\n+-----+\n| الخلية |\n+-----+\n```")).toEqual([{ type: "diagram", labels: ["الخلية"], connected: false }]);
  });
  it("preserves program code and Markdown horizontal rules", () => {
    const text = "---\n```js\na -> b\n```";
    expect(parseNotebook(text)).toEqual([{ type: "markdown", content: text }]);
  });
  it("does not expose isolated ASCII art as Markdown", () => {
    expect(parseNotebook("+++" )).toEqual([{ type: "diagram", labels: [], connected: false }]);
  });
  it("normalizes OCR bullets and numbered steps without changing sequence", () => {
    expect(parseNotebook("• تعريف\n• مثال\n.1 تحضير\n2 تسجيل")).toEqual([{ type: "markdown", content: "- تعريف\n- مثال\n1. تحضير\n2. تسجيل" }]);
  });
  it("adds the missing delimiter for an explicitly pipe-separated OCR table", () => {
    expect(parseNotebook("الكمية | القيمة\nالسرعة | 20")).toEqual([{ type: "markdown", content: "الكمية | القيمة\n--- | ---\nالسرعة | 20" }]);
  });
});