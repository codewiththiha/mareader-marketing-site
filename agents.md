# Agent guidance

- Keep the site self-contained and preserve the reference copy, layout, theme behavior, and scene timing.
- Use Svelte 5 runes and keyed loops. Keep TypeScript strict and avoid lint suppression comments.
- Do not add comments to CSS or HTML comments to Markdown.
- Run `npm run verify` before committing. Commit subjects must be at most 50 characters.
- For visual changes, compare both builds using `tools/visual` and inspect the resulting report.
