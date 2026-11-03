# MaReader marketing site

A Svelte 5 and Vite implementation of the MaReader marketing site. The reader windows and animated feature demonstrations are rendered as components; the production build is a single HTML file.

## Development

Use Node 20.19 or later (or 22.12 or later), then run:

```sh
npm ci
npm run dev
npm run hooks
```

`npm run verify` checks formatting, lint, Svelte types, the comment policy, dependency audit, and the production build. `npm run build` writes `dist/index.html`.

## Visual comparison

Install Chromium with `npx playwright install chromium`. Build this site and a reference build, then run:

```sh
node tools/visual/capture.mjs --dir dist --label new
node tools/visual/capture.mjs --dir /path/to/reference/dist --label ref
node tools/visual/diff.mjs
```

The 42-shot matrix covers seven scenes, light and dark themes, desktop and mobile sizes, and several animation frames. Captures and a mismatch report are written to `shots/`. The default pixel mismatch limit is 0.15%; set `MAX_DIFF` to override it. The reference needs the icon asset at `src/assets/icon.png` before building if that asset is absent.
