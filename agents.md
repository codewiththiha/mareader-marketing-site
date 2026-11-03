# Agent rules for this repository

## Commits

- Commit subjects are max 50 characters, spaces included.
- `scripts/guard.py` enforces this: a commit-msg hook rejects long subjects,
  `npm run guard` scans tree and history, and CI re-checks every subject.
- Hooks are installed by `npm ci` (prepare runs `scripts/install_hooks.py`).

## Comments

- One line each; never stack consecutive full-line comments.
- A file-top header comment is max four lines.
- Never re-explain in a comment what the code already says.
- The pre-commit hook runs `scripts/guard.py comments` on every commit.

## Code

- TypeScript plus Svelte 5 runes; idiomatic Svelte, not React-flavoured.
- Markup in `src/lib` components, styles in `src/styles` partials.
- Output must stay pixel-identical to the reference design: after any visual
  change run `npm run shots` then `npm run visual` and keep every view passing.

## Commands

- `npm run dev` serve; `npm run build` single-file bundle in `dist`.
- `npm run lint` eslint; `npm run format:check` prettier; `npm run check` svelte-check.
- `npm run test` vitest unit tests; `npm run guard` policy guard.
- `npm run bake` regenerate lens blurs; `scripts/compare-blur.py` checks them.
- `npm run releases` refresh the embedded release-notes snapshot.
- `npm run ci:watch` poll this head's CI run to a verdict (0 green, 1 red, 2 running).
- `npm run shots` capture screenshots; `npm run visual` compare to baselines.
- `npm run review` print the self-review summary and fail on regressions.

## CI

- Jobs: quality (lint, format, check, tests, audit, guard), visual (build,
  screenshots, compare, review), bake (lens blur reproducibility), commits.
- Push only when every job is green, then wait with `npm run ci:watch`.
