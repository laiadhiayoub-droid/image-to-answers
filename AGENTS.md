# Architecture rules
- Non-code OCR uses the isolated FormattedNotebook renderer; code OCR remains preformatted to preserve indentation.
- Parse Markdown with GFM and sanitize raw HTML before rendering; never insert AI-generated HTML or SVG directly.
- Diagram interpretation stays in frontend presentation: render explicit arrow relationships as SVG and ambiguous ASCII drawings as labeled blocks with the source image, without inferring unseen topology.