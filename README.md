# mareader-marketing-site

The site that sells [Mareader](https://github.com/codewiththiha/mareader2): a calm,
native PDF and EPUB reader for macOS, Windows and Linux. Svelte 5, TypeScript,
Vite, three routes, no CSS framework and no component library.

```sh
npm install                      # once
npm run dev                      # http://localhost:5173
npm run gate                     # format, lint, types, tests, build, assets, comments, addresses
```

## What is here

```
src/routes/            Home, Releases, Donate, NotFound
src/components/        Header, Footer, ReaderPreview, QrCode, DonationCard, Link, icons/
src/components/sections/  the home page's six sections
src/lib/               router, theme, platform, content/ (the words, as data)
docs/                  design, architecture, donations, platform, verification, ai-slop, psychology
tools/                 shot.mjs (screenshots + a11y), ci.py (the poller), the two git gates
tests/                 Playwright: routing, the download button, donations, the menu
```

## The three pages

| Route       | What it does                                                               |
| ----------- | -------------------------------------------------------------------------- |
| `/`         | The pitch, the appearance lab, the numbers, the limits, and every download |
| `/releases` | Release notes from v0.0.1 to v0.0.5, cut down from the app's own notes     |
| `/donate`   | Crypto for the world, a mock local view for Myanmar, one press apart       |

## The rules

Read [`AGENTS.md`](AGENTS.md) before changing anything, and
[`docs/ai-slop.md`](docs/ai-slop.md) before changing how it looks. The short
version: one committed design, claims with sources, look at every change in a
screenshot, and never invent a donation address.

## Licence

MIT, see [`LICENSE`](LICENSE). Bundled fonts are listed in
[`ATTRIBUTION.toml`](ATTRIBUTION.toml).
