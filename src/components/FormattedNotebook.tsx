import { useId } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { parseNotebook } from "@/lib/notebook";

function NoteDiagram({ labels, connected, sourceImage }: { labels: string[]; connected: boolean; sourceImage?: string }) {
  const markerId = useId().replace(/:/g, "");
  return (
    <figure className="note-diagram" aria-label="رسم توضيحي">
      {connected && labels.length > 1 ? (
        <ol className="note-diagram-flow">
          {labels.map((label, i) => (
            <li key={i}>
              <div className="note-diagram-node" dir="auto">{label}</div>
              {i < labels.length - 1 && (
                <svg className="note-diagram-arrow" viewBox="0 0 40 40" role="img" aria-label="يتصل بـ">
                  <defs><marker id={`${markerId}-${i}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
                  <path d="M20 2 V32" fill="none" stroke="currentColor" strokeWidth="2" markerEnd={`url(#${markerId}-${i})`} />
                </svg>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <>
          {sourceImage && <img src={sourceImage} alt="الرسم في الملاحظات الأصلية" className="note-diagram-source" />}
          {labels.length > 0 && <ul className="note-diagram-labels">{labels.map((label, i) => <li key={i} dir="auto">{label}</li>)}</ul>}
          {!sourceImage && !labels.length && <figcaption>رسم في الصورة الأصلية</figcaption>}
        </>
      )}
    </figure>
  );
}

export function NotebookMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        table: ({ children }) => <div className="note-table-scroll"><table>{children}</table></div>,
        pre: ({ children }) => <pre dir="ltr">{children}</pre>,
        p: ({ children }) => <p dir="auto">{children}</p>,
        a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
        // Do not fetch image URLs embedded in OCR; illustrations use the uploaded source.
        img: ({ alt }) => <span>{alt}</span>,
      }}
    >{text}</ReactMarkdown>
  );
}

export function FormattedNotebook({ text, sourceImage }: { text: string; sourceImage?: string }) {
  return (
    <article className="note-paper" lang="ar" dir="rtl" aria-label="دفتر الملاحظات المنسق">
      {parseNotebook(text).map((block, i) => block.type === "markdown"
        ? <NotebookMarkdown key={i} text={block.content} />
        : <NoteDiagram key={i} labels={block.labels} connected={block.connected} sourceImage={sourceImage} />)}
    </article>
  );
}