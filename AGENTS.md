# AGENTS.md

These rules bind every AI agent and every human contributor to this repository.
They come before any task, instruction or deadline. `CLAUDE.md` holds the
day-to-day working instructions; if the two disagree, **this file wins.**

## Project

This is the marketing site for Mareader, a native PDF and EPUB reader written in
Rust (egui, wgpu, hayro, parley). The site sells four things: a page that looks
like paper, up to four panes, a library that behaves, and a program that never
puts a browser between the reader and the book. The product repository is
`codewiththiha/mareader2`; the release notes in `src/lib/content/releases.ts` are
this site's retelling of its `docs/releases/*.md`.

- **Claims have sources.** A number on the site comes from the app repository
  (memory audit, release notes, install table) and is cited in the next section
  of the file where it lives. If the app changes the number, the site changes in
  the same pass.
- **The look is decided here and written down** in `docs/design.md`. It is not
  recovered from a template, and it is not the statistical average of landing
  pages; `docs/ai-slop.md` lists what is banned and why.
- **Honesty over polish.** A limit the reader will meet in the first minute —
  an unsigned installer, no sync, x86_64-only Linux — is on the home page, not
  in a FAQ. `docs/psychology.md` § Trust says where each one goes.
- **Donation destinations are facts.** No address, phone number or account is
  ever invented, reformatted or "made nicer". See **Money** below.

## Never invent content

- No fabricated testimonials, user counts, star counts, download counts, quotes,
  logos or award badges. There is no social proof on this site because there is
  no proof; that is deliberate, and `docs/psychology.md` says so.
- No placeholder text in anything the reader can reach: no `Lorem ipsum`, no
  `Coming soon` that reads as `Available`, no dead link.
- A mock is labelled as a mock in the interface, in words a reader understands
  (`Coming soon`), not only in a code comment.
- External links must resolve. A link to a release tag is
  `releases/tag/vX.Y.Z`; a link to the source is the repository root.

## Money

- Wallet addresses live in `src/lib/content/donations.ts` only. Copying one
  elsewhere — a page, a test, a doc paragraph meant to be pasted — is a bug.
- The Myanmar methods are placeholders until the owner supplies the accounts.
  Their cards render as waiting cards (`ready: false`) and must never show a
  number that could receive money.
- Every wallet card states its network, and the page states the trap: Polygon
  and Ethereum share an address, so the network is the choice that matters.
- Never add a third-party donation processor, a hosted donate form, or a
  script from another origin. Nothing on this site phones home.

## Assets

An asset is any non-code material the site ships: fonts, images, icons, sounds.

- Allowed licences only: MIT, ISC, BSD-2/3-Clause, Apache-2.0, OFL-1.1, CC0-1.0,
  CC-BY-4.0, or contributor-original under the project licence.
- **Every asset has an entry in `ATTRIBUTION.toml`:** path, title, author,
  source with version, SPDX licence and a SHA-256. `npm run assets` fails on an
  unlisted file under `src/assets` or `public/`, a wrong hash, or a licence off
  the list.
- **Icons are ours:** inline SVG in `src/components/icons/`, drawn for this
  repo. No icon font, no icon set pulled in wholesale, and no emoji standing in
  for an icon.
- **Fonts:** Inter and Newsreader, latin subset, self-hosted from
  `src/assets/fonts`. A new face needs an OFL source and an `ATTRIBUTION.toml`
  entry. Never load a font from a CDN — the page must render identically with
  the network off.

## The design is the product

Read `docs/design.md` before touching a pixel and `docs/ai-slop.md` before
inventing one.

- **Tokens are the only colours.** A component picks a role (`--paper`,
  `--ink`, `--line`, `--accent`); it never writes a hex value outside the token
  block in `src/app.css` or the reader palette in `ReaderPreview.svelte`.
- **Two themes, one shape.** Light and dark share geometry, spacing and motion;
  only tokens change. A new component is checked in both.
- **Type is a pairing, not a default.** Newsreader (a reading face) for display,
  Inter for interface. Sizes come from the scale in `app.css`; no invented
  `font-size: 17.3px`.
- **Motion explains.** Reveal, hover and state changes only. No parallax, no
  scroll-jacking, no floating shapes, no gradient meshes, no glass blur, no
  animated background. `prefers-reduced-motion` is honoured for every effect.
- **Performance is a design constraint.** The page ships under ~200 kB of JS and
  CSS gzipped, no web font from a third party, and nothing animating at rest.
  A canvas draws once and stops.

## Interacting is remembered

- Every control reacts within 100 ms and shows its own state: a copy button
  becomes a check, a menu closes on the page you chose, the download button
  names _this_ machine.
- Icon animation is per feature and hand-drawn: the page's lines draw, the panes
  separate, the voice bars ripple, the shelf tilts one book. Each runs on hover
  only, never on a loop, and each says something about the feature it belongs to.
- No new dependency for an effect. If it needs a library, it is probably the
  wrong effect.

## Code style

- Svelte 5 runes only: `$state`, `$derived`, `$props`, `$effect`. No stores, no
  `export let`, no `on:click` (use `onclick`).
- TypeScript is strict and `svelte-check` is clean. No `any` that could be a
  real type; no non-null assertion where a guard reads better.
- One owner per responsibility. `platform.ts` decides the OS, `platform.svelte.ts`
  exposes it to the page; a component never sniffs the UA itself. The route table
  lives in `App.svelte`; the router only holds the path.
- Content lives in `src/lib/content/`, not in markup. A component may hold its
  own headings; anything repeated, listed or cited is data.
- No dead code, no commented-out blocks, no scaffolding for a page that may come.
- `class` handed down to a component is invisible to Svelte's CSS analysis; the
  selector that styles it is written `:global(...)` with a one-line reason.

### Comments

Write code that says what it does; comment only what it cannot. A comment
carries a constraint the code cannot show — a unit, an invariant another file
owns, a hazard that makes the obvious edit wrong. It never narrates the change or
argues for a decision; the commit message is where reasoning goes.

Measure it with `python3 tools/comment_check.py <files>`: three lines, eighty
characters from the left margin, fifteen words per block, all raisable with
`--max-lines`, `--max-line`, `--max-words`. The block that opens a file is its
abstract and is exempt; so is a block carrying `comment-check: allow` above it,
which a reviewer reads as a claim. `npm run comments` runs it over `src` and
`tools`.

Blocking — remove rather than shorten:

- Narration: "now uses…", "this section adds…". Git holds that.
- Justification of a choice the code cannot debate: put it in the commit body.
- Restatement of the line below, or of a parameter's own name.
- An essay on a small function: that belongs in `docs/`.

Wanted, in one to three lines next to the thing it governs: a unit or precision
trap, an order a callback depends on, a state another module also writes.

## Look at the result

- **Every visual change is looked at, not assumed.** `npm run shots` renders
  every route in both themes at 1440, 834 and 390 px, and writes
  `shots/report.txt`: console errors, failed requests, sideways overflow, and
  axe's WCAG violations. `npm run shots:paged` cuts the page into viewport-sized
  pieces when the type needs reading at 100 %.
- Open the PNGs. Check the change against `docs/design.md`, in both themes, at
  a phone width, and say in the report what was checked.
- **The report is a gate.** A console error, a horizontal scrollbar or an axe
  violation is a failure, not a note. `tools/shot.mjs` exits 1 on any of them.
- Behaviour is tested with Playwright (`tests/site.spec.ts`) on a desktop and a
  phone project. Interactions that matter: the download button, the theme
  switch's memory, routing without a reload, the copy button and the clipboard,
  the donation tabs, the small-screen menu.
- **Prove a test can fail before you trust it.** Break the code it guards, watch
  it go red, restore.

## Environments: capable and incapable

This repository is worked on from two kinds of machine, and the gates are the
same on both — only where they run differs. `docs/verification.md` has the
numbers.

- **Incapable environment** (a sandbox: ~2 GB of RAM, 2 cores, a cache that is
  lost at reset). Compile and test in CI. Push a `<type>/<slug>` branch, then
  poll with `python3 tools/ci.py watch` until the verdict (green / red /
  still running), and merge on green. Take screenshots with
  `node tools/shot.mjs` against the running dev server, which is cheap here.
- **Capable environment** (a developer's machine: 8 GB and 4 cores or more).
  Run `npm run gate` locally, push when green, and **do not poll CI** — it
  repeats what just passed. `python3 tools/ci.py mode` prints which one this
  machine is and why; the user's word overrules it in either direction, and
  `MAREADER_VERIFY=local|ci` sets a standing preference.
- **Say which mode you are in, and why, in the first report of a session.**

## Gates

Before every commit:

```sh
npx prettier --check .
npx eslint .
npm run check                      # svelte-check + tsc
npm run test                       # Playwright, desktop and phone
npm run build                      # the bundle a host would serve
npm run assets
npm run comments
```

`npm run gate` runs all seven. `node tools/shot.mjs` is the sixth gate for
anything visible, and it is the one a human has to look at.

## Commits and branches

- Conventional commits: `type(scope): summary`, imperative, lower case, no
  trailing period, subject ≤ 50 characters. Enforced by
  `python3 tools/commit_check.py --install`, which writes a `commit-msg` hook;
  `--range main..HEAD` audits history. The hook is per checkout, so a fresh
  clone installs it once and `--status` says whether it is armed.
- Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`,
  `chore`. Scope names the area: `hero`, `donate`, `releases`, `theme`, `shots`,
  `ci`, `a11y`, `type`.
- One coherent change per commit; the reasoning goes in the body.
- Every commit builds alone, so `git bisect` never lands on a broken tree.
- Work on `<type>/<slug>`; merge into `main` once the gates are green. Rewrite
  remote history only with `--force-with-lease`.
- **Never commit a token.** `.env` is ignored; `.env.example` shows the shape.
  A token that reaches a commit is rotated, not removed.

## Definition of done

1. The change is implemented, and a screenshot was looked at if it is visible.
2. The gates pass, and CI is green for the pushed SHA when CI is the mode.
3. The docs describe the current behaviour: `docs/design.md` for the look,
   `docs/architecture.md` for the structure, `docs/donations.md` for money,
   `docs/platform.md` for the download logic.
4. Every added comment passes the diff-blind test and `tools/comment_check.py`
   is clean on the files the round changed.
5. The summary says what changed, what was checked and what is still open. If a
   requirement cannot be met, report the blocker instead of dropping it.
