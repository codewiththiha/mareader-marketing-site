# Architecture

> **Status:** v0.1 · **Last updated:** 2026-10-29

A static Svelte 5 site: three routes, one data layer, no server. Everything that
can be a file is a file; nothing fetches at runtime except a download the reader
asks for.

## The shape

```
index.html ──► src/main.ts ──► App.svelte ──► route component ──► sections ──► components
                   │              │
                   │              └── router.svelte.ts (the path)
                   └── app.css (tokens, base type, primitives)
                                    │
   lib/content/*.ts ────────────────┘  downloads, releases, features, donations
   lib/{theme,platform,locale,qr,reveal,clipboard}.ts
```

- **`App.svelte` owns the route table.** A `Record<path, component>` switch and a
  title per route. Add a page by adding a case and a file; there is no manifest.
- **`router.svelte.ts` owns the path.** History API only, plus `navigate()` and
  `isCurrent()` for `aria-current`. Components never touch `history` directly;
  `Link.svelte` is the one anchor that knows how to route, and it keeps the
  browser's own meaning for a modified click (new tab, save).
- **State is module-level runes, one module per concern.** `theme`,
  `router`, `device`. A component reads them; nothing mirrors them into local
  state, so the hero button, the download table and the footer cannot disagree.
- **Content is data.** `src/lib/content/` holds anything repeated, listed or
  cited, typed. A component may hold its own heading; a list of releases may not.
- **Every page is static.** No data fetch, no API, no analytics, no third-party
  script. The only network requests are the fonts (same origin) and a download
  the reader clicks.

## Routes and hosting

| Path          | File                     | Notes                                      |
| ------------- | ------------------------ | ------------------------------------------ |
| `/`           | `routes/Home.svelte`     | Seven sections, in this order and no other |
| `/releases`   | `routes/Releases.svelte` | A sticky index and five versions           |
| `/donate`     | `routes/Donate.svelte`   | Two views: crypto, and the Myanmar mock    |
| anything else | `routes/NotFound.svelte` | Names the three that exist                 |

Hosted as static files (`npm run build` → `dist/`). Two host rules matter:

- **Deep links need a fallback.** A host that 404s an unknown path gets
  `public/404.html`, which rewrites the address to `/?p=<path>`; `main.ts`
  restores it before mounting. `router.init()` re-reads the address because the
  router module was evaluated before that rewrite.
- **No trailing-slash routes.** `/releases/` and `/releases` are the same page;
  the router normalises. Do not add a route that depends on the slash.

The build is one HTML file, one CSS file, one JS chunk and three font files
(~170 kB of type, ~46 kB of JS, ~8 kB of CSS gzipped). Next.js, a router package
and a UI kit are all bigger than this site, so none of them are here.

## Layering

Four layers, and a file only depends on the ones below it:

| Layer         | Paths                                                     | May use               |
| ------------- | --------------------------------------------------------- | --------------------- |
| L0 data       | `lib/content/*`                                           | types from `lib/*.ts` |
| L1 logic      | `lib/{theme,router,platform,locale,qr,reveal,clipboard}*` | L0                    |
| L2 components | `components/**`                                           | L0, L1                |
| L3 routes     | `routes/**`, `App.svelte`                                 | L0, L1, L2            |

A section never imports a route; a component never imports from `routes/`. The
one allowed exception is a section importing another section's drawing
(`ReaderPreview` in both the hero and the appearance lab).

## The window drawing

`ReaderPreview.svelte` is the site's one illustration of the product. It is HTML
and CSS, not a screenshot:

- its colours are the app's own base modes (`light`, `dark`, `dim`, `black`)
  mixed toward a tint hue with `color-mix(in oklab, …)`, the way the app mixes
  its tokens;
- its texture is `PaperTexture.svelte`, a canvas painted once per size, texture
  and theme, which then idles;
- it is the same component in the hero (two panes, no controls) and in the
  appearance lab (one pane, controlled), so the lab cannot drift from the pitch.

No bitmap of the app is used anywhere. When the app's look changes, this file
changes, which is cheaper than seven screenshots in seven states.

## Adding a section

1. Put the words in `src/lib/content/` if they are a list or a claim with a
   source; otherwise keep them in the section.
2. Build it with tokens (`--paper`, `--ink`, `--line`, `--accent`), the type
   scale, and `use:reveal` for entry.
3. Place it in the order that answers the reader's next question
   (`docs/psychology.md` § Order): after the pitch, before the download, with the
   limits before the ask.
4. `npm run shots` in both themes at 1440 and 390; read the report.

## What is deliberately absent

- No SSR, no hydration, no server functions: the site is four documents.
- No CSS framework: `app.css` is ~430 lines of tokens and primitives, and the
  rest lives beside its component.
- No analytics, cookie banner, chat widget or newsletter form.
- No test that needs a network; Playwright runs against the local dev server.
