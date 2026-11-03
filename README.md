# Mareader Marketing Site

Marketing site for [Mareader](https://github.com/codewiththiha/mareader2), a calm
reader for PDF and EPUB. Svelte 5 + TypeScript + Vite, hash-routed single page
with a sticky film section, platform-aware downloads, release notes and a
donation desk (crypto worldwide, local methods for Myanmar).

## Stack

- Vite 8 + Svelte 5 runes, TypeScript strict
- Styling: custom design tokens in `src/app.css` (Tailwind 4 imported for utilities)
- Fonts: Inter Variable + Literata Variable via `@fontsource-variable`
- Icons: `@lucide/svelte` plus hand-drawn chain marks in `src/lib/support/marks.ts`
- QR: `qrcode-generator`, rendered as theme-aware inline SVG
- Single-file production bundle via `vite-plugin-singlefile`

## Commands

```
npm ci
npm run dev          # dev server on 0.0.0.0:5173
npm run build        # production bundle in dist/
npm run preview      # serve dist/ on 0.0.0.0:4173
npm run check        # svelte-check
npm run lint         # eslint
npm run format       # prettier write
npm run format:check # prettier check
npm run validate     # commit + comment rule gate
npm run test         # playwright: behaviour + screenshot capture
npm run screenshots  # screenshot capture only
npm run releases     # pull release notes from mareader2 into src/lib/releases
npm run ci:watch     # wait on a CI run from the terminal
python3 scripts/eval.py  # self review: build, shots, structure, addresses
```

## Routes

Hash routes, no server required: `#/` home (film + download), `#/releases`
notes per version, `#/support` donation desk.

## Structure

- `src/App.svelte` — shell, header, footer, route switch
- `src/lib/router.svelte.ts` — hash router
- `src/lib/platform.ts` — OS/arch detection (UA + UA-CH) and installer choice
- `src/lib/downloads.ts` — installer matrix per OS/arch/format
- `src/lib/scenes.ts` — film beats: focus targets, layouts, themes
- `src/lib/components/Film` — sticky film, camera damping, mock window
- `src/lib/sections` — Home, Facts, DownloadSection, Releases, Support
- `src/lib/sections/support` — CryptoPanel, LocalPanel (Myanmar mock)
- `src/lib/support/wallets.ts` — verified donation addresses, chain registry
- `src/lib/support/geo.svelte.ts` — locale/timezone hint for the local view
- `src/lib/support/myanmar.ts` — local methods, mocked until live
- `src/lib/releases/data.ts` — generated release notes (do not hand edit)
- `src/lib/stores/theme.svelte.ts` — light/dark with persistence
- `src/lib/actions` — reveal and mount actions

## Donations

One EVM address receives on Ethereum, Base, Arbitrum, OP, Polygon, BNB, Linea,
Monad and Arc; the chain picker only changes the explorer link and QR mark.
Bitcoin, Solana, Tron and Stellar have their own cards. QR codes re-colour with
the theme. The Myanmar view (KBZPay, Wave, AYA, CB, bank transfer) is a mock
behind one segmented control; timezone/locale hint offers it first to visitors
from Myanmar.

## Rules

Commit subjects are <=50 chars, imperative, no trailing period. Comments are
single line; file headers max 4 lines. `scripts/commit_check.py` and
`scripts/comment_check.py` enforce this; `.git/hooks/commit-msg` and
`.git/hooks/pre-commit` run them, and `scripts/validate.py` checks history.

## CI

`.github/workflows/ci.yml`: validate, build, static checks, playwright tests
and screenshots, eval report; screenshots and the report upload as artifacts.
