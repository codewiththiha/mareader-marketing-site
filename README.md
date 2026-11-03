# mareader marketing site

Marketing site for MaReader — a calm reader for PDF and EPUB — rewritten from scratch in TypeScript and Svelte 5. The rebuild is pixel-identical to the original React implementation and compiles to a single self-contained `dist/index.html`.

## Quick start

```bash
npm ci
npm run dev        # local dev server
npm run build      # single-file production build in dist/
npm run check      # svelte-check, zero diagnostics
npm run lint       # eslint flat config, --max-warnings 0
npm run format     # prettier write (format:check to verify)
npm run review     # full self-review: checks + build + screenshots + pixel compare
npm run hooks      # install the commit-msg hook (commit messages <= 50 chars)
```

## Stack

- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`), snippets and `.svelte.ts` reactive modules — no React idioms.
- TypeScript strict, Vite 8 with `vite-plugin-singlefile`, Tailwind CSS 4 through `@tailwindcss/vite`.
- lucide-svelte plus hand-ported local icons (`src/lib/icons/`), Inter and Literata webfonts.
- eslint 10 flat config with typescript-eslint strict and eslint-plugin-svelte recommended+prettier; svelte-check; prettier with the svelte plugin.

## Architecture

- `src/lib/stage/runner.svelte.ts` — `StageRunner`: the shared scene engine (looping clock from `src/lib/clock.svelte.ts`, viewport tracking, focus-box measuring, zoom transform and focus-ring geometry). Scenes own a typed runner instance; `StageShell.svelte` binds the DOM to it through the structural `StageView` interface.
- `src/lib/scenes/*.ts` — plain step timelines for the six feature scenes (Themes, Panes, PanePerTheme, Models, Dictionary, ReadAloud); `src/components/scenes/*.svelte` render them.
- `src/components/mock/` — the faux reader window, overlays and settings popover shared by every scene.
- `src/components/site/` — nav, hero, feature sections, download and footer.
- `src/lib/` also holds content, palette, design tokens, timeline maths and the in-view action.

## Visual parity tooling

- `tools/visual/baseline/` — reference screenshots of the original React build (four views: desktop light/dark/hero, mobile light).
- `node tools/visual/capture.mjs --url <url> --out <dir>` — deterministic capture: frozen `requestAnimationFrame`, gated focus measuring (`window.__measureGo`), zeroed transition/animation durations, font-ready waits.
- `node tools/visual/compare.mjs --shots <dir> --baseline tools/visual/baseline --max 0.005 --threshold 0.1` — pixelmatch comparison; exits non-zero above the ratio.
- `node tools/visual/evaluate.mjs` (aka `npm run review`) — the self-review pipeline: eslint, svelte-check, prettier, `npm audit --audit-level=low`, comment policy, commit-message policy, react-idiom scan, runes usage, single-file build, screenshots and pixel parity. Writes `tools/visual/REPORT.md` and fails the exit code on any red row.

## Repository rules

See `AGENTS.md`. In short: commit messages are at most 50 characters per line (enforced by `tools/check_commit_message.py` through the `commit-msg` hook and in CI), and comments are single-line, top-of-file header blocks of at most four lines that never restate the code (enforced by `tools/check_comments.py`). Dependencies are pinned exactly and `npm audit` must stay clean at the low severity level.

## CI

`.github/workflows/ci.yml` runs the whole self-review on every push (screenshots included, uploaded as an artifact together with the report). Only when the review verdict is PASS does the `publish` job push the built `dist/` to the `main2-dist` branch.
