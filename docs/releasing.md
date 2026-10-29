# Releasing

> **Status:** v0.1 · **Last updated:** 2026-10-29

The site follows the app. A release in `codewiththiha/mareader2` lands here as
five small edits and one look.

## The order

1. **Wait for the app's installers to exist.** The download links point at
   `releases/download/vX.Y.Z/<file>`; a link published before the asset is
   uploaded is a 404 for every visitor.
2. **`src/lib/content/downloads.ts`** — change `VERSION`. Nothing else, unless a
   filename convention changed. The asset URL and every row are derived from it.
3. **`src/lib/content/releases.ts`** — add the version at the top, move
   `current: true` to it, and write the entry from the app's
   `docs/releases/vX.Y.Z.md`. Keep the shape: a headline of two or three words, one
   sentence of tagline, four to six changes with a title and one sentence each,
   and the fixes as a flat list. This is a retelling for a visitor, not a mirror
   of the changelog: keep what changes what a reader can do.
4. **The home page** — if the release changes the hero's claim (say, sync ships),
   update `src/components/sections/Hero.svelte` and the limits table in
   `src/components/sections/Limits.svelte` in the same commit. A limit that has
   stopped being true is a lie, and a feature that has shipped but is still
   listed as missing costs a download.
5. **`package.json` version** — bump to match, so the build's identity is honest.
6. **Look at it.** `npm run shots`, then read `/releases` in both themes at 1440
   and 390. The sticky index at the top of the page is the part most likely to
   break when a sixth version arrives.

## Checksum and install text

The "first launch" and "checking a download" paragraphs in
`DownloadSection.svelte` are about unsigned builds. When the app is notarised and
signed, that paragraph is deleted — not softened — and the limits table loses its
"Signing" row.

## The donate page does not follow a release

Nothing there changes with a version. It changes when the owner supplies the
Myanmar accounts (`docs/donations.md` § When this becomes real) or a wallet
address changes — and an address change is its own commit, checked by hand
against the address the owner wrote.

## A release checklist

```sh
# after editing VERSION and releases.ts
npm run check && npm run lint && npm run test && npm run build
npm run shots
# open shots/releases-light-1440.png and shots/releases-dark-390.png
# confirm every link resolves: open two of them by hand
git commit -m "feat(releases): publish 0.0.6"     # ≤ 50 characters
```

The subject limit is 50 characters; `tools/commit_check.py` enforces it.
