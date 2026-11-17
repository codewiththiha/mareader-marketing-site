# Mareader Marketing Site

Marketing site for [Mareader](https://github.com/codewiththiha/mareader), a calm
reader for PDF and EPUB. Svelte 5 + TypeScript + Vite, with independent feature
previews, platform-aware downloads, release notes and a donation desk.

## Stack

- Vite 8 + Svelte 5 runes, TypeScript strict
- Styling: custom design tokens in `src/app.css` and the home layout in `src/lib/sections/home.css`
- Fonts: Inter Variable + Literata Variable via `@fontsource-variable`
- Icons: `@lucide/svelte` plus hand-drawn chain marks in `src/lib/support/marks.ts`
- QR: `qrcode-generator`, rendered as theme-aware inline SVG
- Cacheable production assets; downloads, releases and support load only when visited

## Commands

```sh
npm ci
npm run dev          # dev server on 0.0.0.0:5173
npm run build        # production site and assets in dist/
npm run preview      # serve dist/ on 0.0.0.0:4173
npm run check        # svelte-check
npm run lint         # eslint
npm run format       # prettier write
npm run format:check # prettier check
npm run validate     # commit + comment rule gate
npm run test         # playwright: behaviour + screenshot capture
npm run screenshots  # screenshot capture only
npm run test:browsers # previews, downloads, releases and support across browsers
npm run demos:record # regenerate preview clips; requires ffmpeg and Playwright Chromium
npm run releases     # pull releases from mareader into src/lib/releases
npm run ci:watch     # wait on a CI run from the terminal
python3 scripts/eval.py  # self review: build, shots, structure, addresses
```

## Routes

Hash routes: `#/` home (previews + download), `#/downloads` every latest-release
file with the detected desktop OS first and highlighted, `#/releases` notes per version,
and `#/support` donation desk. On desktop, a keyboard-accessible version outline
switches the release notes; on mobile, each release, including the latest, can be
folded. Versions through v0.0.5 keep their full notes; newer versions show the
marked `## Summary` and link to the full GitHub release. If a newer summary is
missing, the page links to GitHub without showing the full note inline. Download
links are taken from the same live or baked release data as the notes; unknown
files and checksums are listed too. Native Windows and Linux ARM64 files are
separate from x64, and a missing ARM file never falls back to x64. Phones and
unknown systems see all choices without a guessed highlight. Downloading a Mac
or Windows installer starts the download and opens a dismissible first-launch
guide for the selected file; Linux files do not open a guide. Deploy the whole
`dist/` directory: its relative asset URLs also work when hosted under a
subdirectory.

## Feature previews

Home uses short, silent H.264 loops and descriptive stills in `public/demos/`.
They are recorded from the existing Svelte reader mock, not a live app. A
preview loads and begins at the first frame only after it enters the viewport;
it pauses and resets when it leaves or the tab is hidden. Reduced-motion and
Save-Data preferences keep the stills and avoid video downloads. The playback
observer has a scroll/resize fallback for older browsers.

To update a clip, adjust the scene data or mock under `src/lib/components/Film/Mock`,
install Playwright Chromium with `npx playwright install chromium`, and run
`npm run demos:record` with `ffmpeg` (including `libx264`) on the path. The
capture harness and interaction sequences live in `scripts/demos/`. To regenerate
only the four-pane hero stills, run `npm run demos:record -- --hero-only`; for one
clip and its poster, use `npm run demos:record -- --clip=panes` (or another clip
name). For the optional cross-browser suite, first install its browsers:

```sh
npx playwright install firefox webkit
```

## Structure

- `src/App.svelte` — shell, header, footer, lazy route switch
- `src/lib/router.svelte.ts` — hash router
- `src/lib/platform.ts` — OS/arch detection (UA + UA-CH) and installer choice
- `src/lib/downloads.ts` — installer matrix per OS/arch/format
- `src/lib/previews.ts` — feature copy and demo asset paths
- `src/lib/actions/viewportLoop.ts` — viewport, motion, data and tab-aware playback
- `src/lib/components/Preview` — borderless previews with still-image fallbacks
- `src/lib/scenes.ts` and `src/lib/components/Film/Mock` — source of recorded demos
- `src/lib/sections` — Home, Facts, DownloadSection, Releases, Support
- `src/lib/sections/support` — CryptoPanel, LocalPanel (Myanmar mock)
- `src/lib/support/wallets.ts` — verified donation addresses, chain registry
- `src/lib/support/geo.svelte.ts` — locale/timezone hint for the local view
- `src/lib/support/myanmar.ts` — local methods, mocked until live
- `src/lib/releases/data.ts` — generated release notes (do not hand edit)
- `src/lib/releases/notes.ts` — version cutoff and structured summary parsing
- `src/lib/stores/theme.svelte.ts` — light/dark with persistence

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
