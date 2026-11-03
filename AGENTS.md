# AGENTS Guide

## Commit messages

- Keep subject <=50 chars including spaces.
- Use imperative mood: `add`, `fix`, `update`, `refactor`.
- No period at end.
- Example: `add film camera easing`
- Validation: `python3 scripts/validate.py` must pass.
- Hook: `.git/hooks/commit-msg` checks length, rejects >50.

## Comments

- Each comment must be single line only.
- No `/* ... */` spanning multiple lines.
- Header block at top of file max 4 lines.
- Avoid restating code; explain why, not what.
- Validation: same `scripts/validate.py` checks header count and block span.
- Hook: `.git/hooks/pre-commit` runs validation.

## Workflow

- Run `npm run validate` before commit.
- Run `npm run build` to ensure production bundle ok.
- CI (`.github/workflows/ci.yml`) runs build, validate, screenshots, eval.

## Architecture

- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`).
- No React patterns; use actions and stores.
- Modular: `lib/components`, `lib/stores`, `lib/actions`, `lib/sections`.
- Pixel perfect vs original React build.

## Push

- Only push after CI passes locally.
- Force push to `main` replaces upstream.

## Commands

- `npm run dev` — local preview
- `npm run build` — production
- `npm run validate` — lint commits/comments
- `npm run screenshots` — visual capture
