# Verification: capable and incapable environments

> **Status:** v0.1 · **Last updated:** 2026-10-29

The gates are the same everywhere; only **where** they run differs. One is a
sandbox with about 2 GB of RAM and two cores whose `node_modules` and browser
cache vanish on reset; the other is a workstation. Neither mode is permanent — an
agent picks per session and the user can overrule it at any time.

|                    | Incapable (sandbox)                               | Capable (workstation)           |
| ------------------ | ------------------------------------------------- | ------------------------------- |
| Lint, types, build | in CI                                             | locally                         |
| Browser tests      | in CI (`Rust`-style job, here `Playwright`)       | locally                         |
| Screenshots        | `node tools/shot.mjs` locally — cheap, no compile | the same                        |
| Verdict            | `python3 tools/ci.py watch`                       | `npm run gate`                  |
| Polling            | yes, until the verdict                            | **no** — it repeats what passed |

## Choosing

Highest precedence first:

1. **The user's words.** "Use CI" means CI mode even on a fast machine; "run it
   here" means local mode even on a slow one.
2. **`MAREADER_VERIFY=local|ci`** in the environment: a standing preference.
3. **`python3 tools/ci.py mode`**, which reads RAM (cgroup-aware), cores and free
   disk and prints a recommendation with its reasons. It picks local mode at
   4 GiB, 4 cores and enough disk; otherwise CI mode.

State the mode and why in the first report of a session, e.g. "CI mode: 1.9 GiB,
2 cores". Measured in this repository's sandbox on 2026-10-29:

|                                                               | Time   |
| ------------------------------------------------------------- | ------ |
| `npm install` (cold, with `.npmrc` legacy peers)              | 8 s    |
| `npm run check` (svelte-check + tsc)                          | 8 s    |
| `npm run lint` (eslint, flat config)                          | 3 s    |
| `npm run test` (Playwright, 26 tests, two projects)           | 25 s   |
| `npm run build`                                               | 3 s    |
| `npm run shots` (18 PNGs: 3 routes × 2 themes × 3 widths)     | 57 s   |
| `node tools/shot.mjs --routes / --themes light --widths 1440` | 5 s    |
| `npx playwright install chromium` (+ system libs via apt)     | ~2 min |

So this site's gates are cheap anywhere, and the only reason to prefer CI is that
a sandbox loses the browser and `node_modules` at reset. On a machine where those
survive, local mode is faster than a CI round trip and is the default.

## Local mode

```sh
npm run gate        # format:check, lint, check, test, build, assets, comments
npm run shots       # then look at the PNGs and read shots/report.txt
```

Push when green. Do not poll CI; glance at it with
`python3 tools/ci.py watch --once` at the start of the next session if CI has been
configured for the repository.

## CI mode

1. **Run the cheap checks locally.** They need no browser:
   `npm run check`, `npm run lint`, `npm run format:check`,
   `python3 tools/comment_check.py src tools`, and
   `python3 tools/commit_check.py --range origin/main..HEAD`.
2. **Commit on a `<type>/<slug>` branch and push it.** CI runs on pushes to
   `feat/`, `fix/`, `perf/`, `refactor/`, `docs/`, `test/`, `build/`, `ci/` and
   `chore/` branches, so `main` only ever takes green commits.
   `python3 tools/ci.py branch` says whether the current branch qualifies.
3. **Watch the verdict:** `python3 tools/ci.py watch`. Exit code 0 is green, 1 red
   (it stops at the first failing job and prints that job's last 25 log lines),
   2 still running or no run yet.
4. **Red:** fix, commit, push, watch again. Never re-run a green run, and never
   re-run a red one hoping.
5. **Green:** merge into `main` (`git push origin HEAD:main` or a pull request),
   delete the branch, and take the shots for anything visible.

## The shot tool is a gate

`tools/shot.mjs` is not only a camera. For every route, theme and width it
collects:

- console errors and page errors;
- failed requests (a missing font, a broken asset);
- elements that sit outside the viewport;
- horizontal overflow of the document;
- **axe** violations at WCAG 2.1 A/AA.

It writes `shots/report.txt` and exits 1 if any of those appear, so it can gate a
round. `--no-audit` skips axe for a quick look; `--paged` cuts each page into
viewport-sized shots for reading type at 100 %; `--viewport-only` shoots the first
screen only.

The reveal animation hides everything below the fold, so the tool walks the page
before shooting — worth remembering if you add a scroll effect that the walk
cannot trigger.

## The QR gate

`tools/qr_check.mjs` screenshots each donation code at 3× and decodes it with
jsQR, comparing the text to the address in `src/lib/content/donations.ts` by
hand — deliberately not importing the page's builder, or a bug in it would agree
with itself. It runs after any change to `qr.ts`, `QrCode.svelte`, the theme
tokens or the card's size, and it is the only evidence that a theme-aware,
rounded code is still a readable one.

## The two git gates

- **`tools/commit_check.py`** refuses a subject over 50 characters. Install once
  per checkout with `--install`; `--status` says whether the hook is armed (git
  silently skips a hook it cannot execute); `--range main..HEAD` audits history.
- **`tools/comment_check.py`** enforces the brevity rule in `AGENTS.md`: three
  lines per block, 80 characters per line, 15 words. The block that opens a file
  is its abstract and is exempt; `comment-check: allow` above a block marks a
  deliberate exception. `--self-test` proves the scanner on fixtures.

## The token

- Reads of a public repository need no token; dispatching and log fetching do.
- `tools/ci.py` reads `GITHUB_PAT` from the environment or from `.env` in the
  repository root. `.env` is git-ignored; `.env.example` shows the shape.
- The token is never printed and never written. If one ever reaches a commit,
  rotate it — removing it from history is not enough.

## Known limits of this setup

- The sandbox's browser lives in `~/.cache/ms-playwright`, which is **not** part
  of the workspace snapshot: after a reset, run
  `npx playwright install chromium` again (and the `apt` line for its system
  libraries, if the image is new).
- `.npmrc` sets `legacy-peer-deps`. Vite 8 and `@sveltejs/vite-plugin-svelte` 7
  declare each other through peers that npm 10's arborist cannot resolve
  (`Cannot read properties of null (reading 'edgesOut')`). Remove the line when a
  plain `npm install` succeeds.
- `.github/workflows/ci.yml` runs the same gates on every push to a `<type>/`
  branch or to `main`, and uploads the shot report as an artifact. It is what
  `tools/ci.py watch` reads; a push that only touches `docs/` still runs it,
  because the docs are part of the product here.
