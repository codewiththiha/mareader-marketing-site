# AGENTS.md

Rules for every agent and human working in this repository. They are enforced mechanically; do not look for ways around them.

## Commit messages

- Every line of a commit message, including whitespace, is at most 50 characters.
- Enforcement: `tools/check_commit_message.py` runs as the `commit-msg` git hook (install once with `python3 tools/install_hooks.py`, or `npm run hooks`) and again in CI over the full history (`--log`).
- Subject line first, imperative mood, no trailing period.

## Comments

- A comment is at most one line long. Multi-line block comments are violations everywhere.
- Comments appear only at the very top of a file, as one contiguous header block of at most 4 lines.
- A comment never explains what the code already says. Name things well instead; reserve header lines for intent, invariants and constraints the code cannot show.
- No inline, trailing, or disabled-code comments. No TODO/FIXME markers.
- Enforcement: `python3 tools/check_comments.py .` (also part of `npm run review` and CI).

## Visual parity

- The rewrite was proven pixel-identical to the original React build at commit `4bf842f`; those proofs live in `tools/visual/baseline-react/` and stay untouched as history.
- From then on `tools/visual/baseline/` is the approved Svelte state: nine views (home light/dark/hero/mobile, releases light/dark, donate light/dark and donate local). It is a regression gate — any change that moves a pixel fails CI until the change is reviewed and the baseline is deliberately refreshed.
- `node tools/visual/capture.mjs --url <url> --out <dir>` captures every view; `node tools/visual/compare.mjs` diffs them with pixelmatch (threshold 0.1, max ratio 0.005).
- Captures freeze `requestAnimationFrame`, gate the focus-measure interval behind `window.__measureGo` and force-load webfonts, so captures settle on identical geometry every run.
- Fix the component, never the baseline; refresh the baseline only in the same commit as the reviewed visual change.

## Svelte style

- Idiomatic Svelte 5 only: runes (`$state`, `$derived`, `$effect`, `$props`), snippets, `$lib`/`$components` aliases, `.svelte.ts` modules for reactive state.
- No React idioms: no hooks, no providers, no conditional hook-like patterns, no `useState`/`useEffect` ports.
- Strict tooling: `npm run lint` (eslint, `--max-warnings 0`), `npm run check` (svelte-check), `npm run format:check` (prettier) must all pass with zero diagnostics.
- Deliberate, scoped rule exceptions live in `eslint.config.js` and nowhere else: bundled trusted SVG rendering in `ProviderLogo.svelte`, and the lyric word spacing / explicit children snippet in `ReadAloudScene.svelte`.

## Dependencies

- All versions pinned exactly (`--save-exact`); no caret ranges.
- `npm audit --audit-level=low` must report zero issues; vulnerable transitive deps are pinned through `overrides`, or the dependency is replaced.
- Before adding anything, check for a lighter first-party alternative already in the tree.

## Workflow

- `npm run dev` serve, `npm run build` single-file `dist/index.html`, `npm run check`, `npm run lint`, `npm run format`, `npm run review` full self-review (static checks + build + screenshots + pixel compare, writes `tools/visual/REPORT.md`).
- CI (`.github/workflows/ci.yml`) runs the same self-review on every push and only publishes `dist/` to the `main2-dist` branch when the verdict is PASS.
