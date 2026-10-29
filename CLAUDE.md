# CLAUDE.md

How to work in this repository, day to day. `AGENTS.md` holds the binding rules
and wins over this file; when the two disagree, follow `AGENTS.md`.

## Start every session here

1. `python3 tools/ci.py mode` — say which environment this is and why, in your
   first report. A sandbox (2 GB, 2 cores) is **incapable**: build and test in
   CI. A workstation is **capable**: run the gates locally and skip the poll.
2. `python3 tools/commit_check.py --status` — is the subject-length hook armed?
   A restored checkout can lose its mode, and git skips a hook it cannot run.
3. Read `docs/design.md` if the work is visible, `docs/architecture.md` if it is
   structural, `docs/donations.md` if it touches money.
4. `npm run dev`, then look at what is there before changing it.

Don't stop to ask unless the decision is on the owner's list below.

## Owner decisions (ask, don't guess)

- Anything that sends money somewhere, or changes what a donation card says.
- Publishing a version: bumping `VERSION`, the download table, the release notes.
- A new external dependency, a new font, or a new origin in the page.
- Adding a page other than `/`, `/releases`, `/donate`.
- Removing a claim a reader may have come for, or a limit from the home page.
- Anything that lists the reader's data, calls an API, or adds analytics. The
  answer is expected to be no.

## Where things are

| Path                                              | What                                                            |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `src/App.svelte`                                  | The route table, the document title, the skip link              |
| `src/lib/router.svelte.ts`                        | The path, and `navigate()`; no page knows about history         |
| `src/lib/theme.svelte.ts`                         | Light / dark / system, and the paint                            |
| `src/lib/platform.ts`                             | The OS and architecture guess, with its rules and limits        |
| `src/lib/platform.svelte.ts`                      | One shared answer for the hero, the list and the footer         |
| `src/lib/locale.ts`                               | The Myanmar guess for the donation page, made without a network |
| `src/lib/qr.ts`                                   | Builds the dotted QR codes; `QrCode.svelte` draws them          |
| `src/lib/reveal.ts`                               | The scroll-reveal action (`use:reveal`)                         |
| `src/lib/content/`                                | Downloads, releases, features, donations — the words as data    |
| `src/components/sections/`                        | The home page, one file per section                             |
| `src/components/ReaderPreview.svelte`             | The drawn reader window, in both themes                         |
| `tools/shot.mjs`                                  | Screenshots, the layout critic and the a11y report              |
| `tools/ci.py`                                     | `mode`, `watch`, `branch` — the poller                          |
| `tools/commit_check.py`, `tools/comment_check.py` | The two git gates                                               |
| `tests/site.spec.ts`                              | Playwright: routing, downloads, donations, menu, theme          |

## Commands

```sh
npm run dev                  # dev server on 0.0.0.0:5173 (previewable)
npm run build && npm run preview
npm run check                # svelte-check + tsc
npm run lint                 # eslint, flat config
npm run format               # prettier, writes
npm run test                 # playwright, desktop and phone
npm run shots                # PNGs into shots/, plus shots/report.txt
npm run shots:paged          # viewport-sized pieces, for reading type
npm run gate                 # everything a commit must pass
python3 tools/assets_check.py
python3 tools/comment_check.py src tools
python3 tools/commit_check.py --install
python3 tools/ci.py watch    # CI mode only
```

## The look loop

1. `npm run dev` (or `npm run build && npm run preview` to check the real bundle).
2. `node tools/shot.mjs --routes / --themes light,dark --widths 1440,390` for a
   fast look, `npm run shots` for the full sweep.
3. Open the PNGs from `shots/`. Read `shots/report.txt` — it is the critic, and
   it fails the run on a console error, an overflow or an axe violation.
4. Fix, re-shoot, and say in the report which routes, themes and widths you saw.

Notes that save time:

- The reveal animation hides everything below the fold, so a full-page shot walks
  the page first. `--paged` does the same, then cuts the shots into viewport
  pieces.
- `shots/` is git-ignored. A shot is evidence in a report, not a deliverable in
  the repo.
- The dev server binds `0.0.0.0` and `allowedHosts` is open so the sandbox
  preview can reach it. Never point browser code at `localhost`.
- Playwright's Chromium reports a Windows platform; a test that cares about the
  system must say so (`asSystem()` in `tests/site.spec.ts`).

## Working in an incapable environment

- Do not run the full `npm run gate` at the end of every edit: `npm run check`
  and `npm run lint` are cheap; the browser suite and the build are the ones
  worth batching.
- Push a `<type>/<slug>` branch early, then `python3 tools/ci.py watch`. It stops
  at the first red job and prints the failing step's last lines.
- `--once` reads the current state without waiting; `--wait 900` bounds the wait.
- The token comes from `.env` (`GITHUB_PAT`). Never echo it, never commit it.

## House style in one paragraph

Short sentences, concrete numbers, British spelling in prose ("colour",
"licence", "behaviour") and American in code identifiers. Say what a thing does
before how it feels. No exclamation marks, no "seamless", "powerful",
"effortless", "unleash", "supercharge". A heading is a claim, not a label: "The
page is the app", not "Features". The page never addresses the reader as "users".

## When something is wrong

- A claim and the app disagree → the app wins; fix the site and note it in the
  commit body.
- A screenshot looks worse than the section before it → fix the design, not the
  screenshot, and update `docs/design.md` if the rule changed.
- A gate is red for a reason you believe is wrong → report the blocker with the
  log; do not weaken the assertion, exclude the file, or edit the workflow.
