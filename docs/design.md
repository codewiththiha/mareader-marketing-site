# Design

> **Status:** v0.1 · **Last updated:** 2026-10-29

The site's design system. It inherits the app's convictions — paper, ink, quiet
chrome — and adds one it needs of its own: the page should look like it was made
by a person who reads. Everything here is checked by looking at `shots/` in both
themes, at 1440, 834 and 390 px.

## Principles

- **Paper and ink, not glass and glow.** The background is a warm near-white or a
  soft near-black; the type is dark ink or warm light ink. Surfaces are flat with
  a hairline, or tinted one step away from the paper. Nothing is translucent, and
  there is no blur anywhere on the page.
- **One committed palette.** A single blue (`#1c4ed8` / `#2f5ce0` as a fill) for
  what to do; a single gilt (`#9a7440`) for the book's ribbon and nothing else.
  There is no secondary "brand accent", no teal, no violet.
- **Type does the work.** Two faces, one scale, generous leading. A section is
  separated by a hairline and space, not by a coloured band or a rounded card.
- **Chrome gets out of the way.** The header is 64 px of paper with a rule that
  only appears once the page is scrolled. The footer is a hairline and two
  columns of small links.
- **The window is the hero image.** The product is shown, in its own colours,
  rather than described by an abstract illustration.

## Type

| Role                                  | Face                  | Size                        | Weight         | Notes                                  |
| ------------------------------------- | --------------------- | --------------------------- | -------------- | -------------------------------------- |
| Display (h1, figures, section titles) | Newsreader (variable) | `--text-3xl` → `--text-2xl` | 400, `opsz` 48 | `-0.018em` tracking, 1.06–1.14 leading |
| Body                                  | Inter (variable)      | `--text-md` (17 px)         | 400            | 1.62 leading, `--measure` 62ch         |
| Lede                                  | Inter                 | `--text-lg`                 | 400            | 1.55 leading, muted ink                |
| Label / eyebrow                       | Inter                 | 13 px, 500                  |                | 0.04em tracking, uppercase, muted      |
| Small                                 | Inter                 | 13 px                       | 400            | notes, captions, filenames             |

- The hero's last three words are set in Newsreader italic. That is the whole
  voice of the page: one italic phrase, in the reading face, on a product about
  reading. Do not repeat the trick elsewhere.
- Filenames and checksums are the only monospace on the site.
- No text is smaller than 13 px. The smallest thing on the page is a folio number
  inside the window drawing, which is decoration and marked `aria-hidden`.

## Colour

Every colour is a token in `src/app.css`. A component picks a role.

| Token            | Light     | Dark      | Used for                              |
| ---------------- | --------- | --------- | ------------------------------------- |
| `--paper`        | `#fbfaf8` | `#101012` | the page                              |
| `--paper-raised` | `#ffffff` | `#17171a` | cards, the header menu                |
| `--paper-sink`   | `#f3f1ea` | `#141416` | alternating sections, quiet buttons   |
| `--paper-deep`   | `#eae7de` | `#1d1d21` | pressed states, code chips            |
| `--ink`          | `#191a1c` | `#ecebe7` | headings, primary text                |
| `--ink-soft`     | `#494b4f` | `#b7b6b1` | body copy                             |
| `--ink-muted`    | `#63666d` | `#8b8a85` | notes, captions (4.5:1 on paper)      |
| `--line`         | `#e3dfd6` | `#27272c` | hairlines, dividers                   |
| `--line-strong`  | `#cec9bd` | `#3a3a41` | control borders, active rules         |
| `--accent`       | `#1c4ed8` | `#9db8ff` | links, focus, the one action          |
| `--accent-fill`  | `#1c4ed8` | `#2f5ce0` | the download button's fill            |
| `--accent-wash`  | `#eef2fd` | `#161c2e` | the Myanmar prompt, the current badge |
| `--gilt`         | `#9a7440` | `#c8a273` | the book's ribbon, the light-mode sun |

Rules:

- **Contrast is measured, not eyeballed.** Muted text clears 4.5:1 on paper and
  on the sink; small text on `--paper-raised` uses `--ink-soft`. The shot report
  runs axe and fails on a violation, so a new token is checked the first time it
  is used.
- `--accent` may not be used for decoration. If it is not interactive or the
  current state, it is the wrong colour.
- Tints belong to the _reader window_ (its papers, its tints), never to the page
  around it.

## Space, shape and rules

- A 4 px grid: `--sp-1` … `--sp-10`. Section padding is
  `clamp(56px, 9vw, 112px)`; the container is 1160 px with a fluid gutter.
- Four radii only: 4 px (chips), 7 px (controls, buttons), 11 px (cards), 16 px
  (the window). A circle is only ever the icon mark behind a feature glyph or a
  colour swatch, where a circle means "one of these".
- Sections are separated by `1px solid var(--line)`. Alternating sections use
  `--paper-sink`. Never both a coloured band and a card, never a drop shadow on
  a section.
- Shadows exist for two things: the drawn window, and nothing else. Cards use a
  hairline.

## The reader window

`AppWindow.svelte` draws the app, and it is checked against the app rather than
remembered. mareader2 ships its own shot tool; a drawing that has drifted from
the product is a claim, not an illustration:

```sh
cd ../mareader2
python3 tools/ci.py shots --rev HEAD \
  "reader pdf=sample:12 workers=0 pinned=true platform=mac" \
  "dim pdf=sample:12 workers=0 pinned=true theme=dim" \
  "side pdf=sample:12 workers=0 pinned=true sidebar=outline"
```

Every number below came out of those PNGs, at 2× `pixels_per_point`, so a pixel
in the shot is half a CSS point.

| Part             | The app                                                              | The drawing                                    |
| ---------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| Title bar height | 48 px                                                                | 40 px, cropped to fit                          |
| Rail width       | 288 px                                                               | 232 px, same reason                            |
| Rail header      | lights, panel, search, gear, panel icon                              | the same, in 40 px                             |
| Reader bar       | library, dictionary left; search, palette, menu right; title centred | the same                                       |
| Captions         | macOS none; Windows 46 px each; GNOME circles                        | Windows and GNOME, from `device.value.os`      |
| Page             | meets the pane, no card                                              | the same: `flex: 1`, no margin, no radius      |
| Chapter label    | floats at the pane's top left                                        | the same, 10 px, ink mixed 52 % into the paper |
| Page indicator   | a pill at the bottom right                                           | the same                                       |
| Heading rule     | 2 px of `#d97333` under the title                                    | the same                                       |

Colours are sampled, not invented — `windowPalette()` in `src/lib/appearance.ts`:

| Mode  | Bar       | Rail      | Page      | Ink       |
| ----- | --------- | --------- | --------- | --------- |
| Light | `#f3f4f6` | `#ebedef` | `#ffffff` | `#000000` |
| Dark  | `#17181b` | `#141518` | `#131316` | `#e9eaec` |
| Dim   | `#1d2126` | `#202328` | `#35383d` | `#050606` |
| Black | `#000000` | `#060607` | `#000000` | `#e6e7e9` |

- **Dim is not dark.** The app dims the page and leaves the ink black, so the
  page is grey and the type is black on it. Drawing it like dark mode — light
  ink on a dark page — is the one error that makes the example wrong.
- The icons are Lucide's, the set `crates/ui/src/icons.rs` names, redrawn as SVG
  in `src/components/icons/Chrome.svelte` and attributed in `ATTRIBUTION.toml`.
- The mark is the app's own file, `apps/mareader/icons/logo.svg`, copied into
  `src/assets/brand` and inlined by `Logo.svelte` so it needs no request.
- On a phone the rail and the title go: 350 px of rail and page is furniture.
- Text inside the drawing is decoration and marked `aria-hidden`; the caption
  says what it is, and the appearance summary says what is chosen.

## Blend mode

`BlendFigure.svelte` is the one place where the chrome is left out, because the
switch is about the backdrop, not the bar. Off, the window behind the page is
its own chrome colour and the page sits on it with a shadow. On, the backdrop
takes the page's paper colour and the page's shadow goes: the page and the
window become one surface.

It is named `Blend mode` because that is the app's row, in its Paper settings,
with the same meaning — "the background takes the page's own paper colour"
(`crates/ui/src/settings_window.rs`). The switch is a real `role="switch"`; the
test asserts that on, the backdrop's computed colour equals the page's.

## Texture

`PaperTexture.svelte` paints one canvas, once, from a seeded PRNG:

| Kind    | Drawing                                               |
| ------- | ----------------------------------------------------- |
| `paper` | short fibres, one pixel per ~900 px², alpha 0.05–0.15 |
| `lined` | hairlines every 14 px, alpha 0.14                     |
| `grid`  | the same, both ways                                   |
| `dots`  | 0.9 px dots on the 14 px grid                         |

It redraws on a texture change, a resize or a theme change and otherwise idles.
It is inside the reader window only — the page background is flat paper.

## Motion

Two durations and one curve: `--dur-1` 140 ms for a state change, `--dur-2`
300 ms for a move, `--ease` `cubic-bezier(.22,.68,.24,1)`, plus `--dur-3` 620 ms
for a reveal.

- **Reveal**: 12 px rise and fade, once, when a section first enters
  (`use:reveal`, threshold 0.16, `rootMargin` −8 %). Groups stagger by 45–70 ms.
  The element keeps its layout box, so nothing reflows.
- **Hover**: colour, border and a 1–3 px transform. Never a scale above 1.06.
- **Icon animation** is per feature and hand-drawn (`components/icons/`): the
  page's lines draw themselves, the panes separate, the voice bars run a short
  wave, one book leans off the shelf, the quill's nib draws in, the study card's
  highlight sweeps across. Each runs on hover only and stops.
- `prefers-reduced-motion: reduce` removes the reveal and every transition. It is
  checked by resizing the browser, not by reading the CSS.

## Interaction details

- **The download button names this machine** and carries the arrow that moves
  down on hover. Under it, `v0.0.5 · 64-bit · deb · Every file`.
- **The theme switch** is a 52 × 30 track with a 22 px disc that travels 22 px;
  the sun's rays fade out as the moon fades in. It is `aria-pressed`, not a
  label change.
- **Copy** becomes a check in place, for 2.2 s, with a polite live region. No
  toast.
- **Segmented controls** (paper, texture, the two-step arch switch) are hairline
  tracks with a 5 px inner radius; the chosen one is ink on paper, inverted in
  dark. A track that sets a value for something visible below it (the appearance
  lab) fills its column with equal segments; a track that picks a variant of a
  control (the arch switch) hugs its labels.
- **A donation card** is one address, and it is the same card whether that
  address reaches one network or nine. Top to bottom: the family name with its
  network count, the one-line caveat, then the code beside the address, then the
  network chips and the fee line. A single-network card is that layout with no
  chips — no second variant, no empty rail.
- **The network chips are cells, not a tag cloud.** A grid of
  `auto-fit minmax(96px, 1fr)`: nine of them fill one row at 1440 px and make a
  3 × 3 block on a phone. Equal cells are what says "these are peers"; a ragged
  flex row reads as an afterthought.
- **The address bar takes the width it is given** on the wide card, because it is
  the one thing being copied; a field that stops at 620 px leaves a hole in the
  card's right half. On the single cards the address and the explorer link sit
  level with the code's top and bottom edges.
- **Focus** is a 2 px accent ring at 2 px offset, everywhere, including the skip
  link, which is otherwise off-screen.

## Breakpoints

| Width       | What changes                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------- |
| ≥ 1100 px   | Two-column heads, three-column download table, two-column donation cards; the wide card spans both  |
| 900–1100 px | Heads stack, the appearance lab stacks, cards stay two, chips to five per row                       |
| 720–900 px  | Feature grid to one column, download table stacks with rules, cards to one                          |
| < 720 px    | Nav collapses to the menu, cards to one column, the strip card stacks, the window drops to one page |
| < 560 px    | A card's code goes above its address, up to 208 px; chips make a 3 × 3 block                        |
| < 420 px    | The header's Download button goes; the hero's stays full width                                      |

The page must not scroll sideways at any width; `tools/shot.mjs` fails the run if
it does.
