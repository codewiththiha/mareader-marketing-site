# mareader marketing site

Marketing site for MaReader, a calm reader for PDF and EPUB. Rewritten from scratch in TypeScript and Svelte 5, pixel-identical to the original React implementation, and built to a single self-contained `dist/index.html`.

## Stack

- Svelte 5 with runes, TypeScript in strict mode, Vite 8 with `vite-plugin-singlefile`.
- Tailwind CSS 4 via `@tailwindcss/vite`; design tokens in `src/app.css`.
- lucide-svelte icons plus hand-ported local icons in `src/lib/icons/`.
- eslint (flat config, zero warnings), svelte-check, prettier with the svelte plugin.

## Layout

- `src/lib/` reactive primitives: `clock.svelte.ts` (looping ms clock), `stage/runner.svelte.ts` (scene clock, viewport tracking, focus-ring geometry), `scenes/` step data, `palette.ts`, `timeline.ts`, `design.ts`, `content.ts`.
- `src/components/stage/` the shared stage shell and caption crossfade.
- `src/components/scenes/` the six animated feature scenes.
- `src/components/mock/` the fake reader window, overlays and settings popover.
- `src/components/site/` nav, hero, feature sections, download and footer.
- `tools/` policy checkers (`check_comments.py`, `check_commit_message.py`, `install_hooks.py`) and the visual pipeline (`visual/capture.mjs`, `visual/compare.mjs`, `visual/evaluate.mjs`).
- `tools/visual/baseline/` reference screenshots of the original React build.

## Commands

- `npm install` exact-pinned dependency tree.
- `npm run dev` local dev server.
- `npm run build` single-file production build in `dist/`.
- `npm run check` svelte-check over the whole project.
- `npm run lint` eslint with `--max-warnings 0`.
- `npm run format` / `npm run format:check` prettier.
- `npm run review` full self-review: lint, types, format, audit, comment policy, commit-message policy, build, screenshots, pixel comparison; writes `tools/visual/REPORT.md`.
- `npm run hooks` install the commit-msg hook that enforces 50-character commit messages.

## House rules

See `AGENTS.md`: commit messages are at most 50 characters per line, comments are one line each and only inside a four-line header block at the top of a file, and every change must keep the four reference views pixel-identical to the baseline.

## CI

`.github/workflows/ci.yml` runs the self-review on every push, uploads screenshots, diffs and the report as artifacts, and force-publishes `dist/index.html` to the `main2-dist` branch only when the verdict is PASS.
