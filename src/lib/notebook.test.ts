import { describe, expect, it } from "vitest";
import { parseNotebook } from "./notebook";

describe("notebook content parsing", () => {
  it("preserves headings, ordered steps, bullets, line breaks and Markdown tables", () => {
    const text = "# الفيزياء\n## الطاقة\n1. تعريف\n2. مثال\n- ملاحظة\n\n| الكمية | القيمة |\n| --- | --- |\n| السرعة | 20 |";
    expect(parseNotebook(text)).toEqual([{ type: "markdown", content: text }]);
  });
  it("turns explicit arrows into connected diagram nodes", () => {
    expect(parseNotebook("الضوء -> العدسة -> الصورة")).toEqual([{ type: "diagram", labels: ["الضوء", "العدسة", "الصورة"], connected: true }]);
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
});