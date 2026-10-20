# Architecture rules
- Non-code OCR uses the isolated FormattedNotebook renderer; code OCR remains preformatted to preserve indentation.
- Parse Markdown with GFM and sanitize raw HTML before rendering; never insert AI-generated HTML or SVG directly.
- Diagram handling stays in the notebook parser and presentation CSS: use the existing source-image branch for all detected drawings, with an object-fit crop at their text position, to preserve originals without reconstructing topology or rewriting components.