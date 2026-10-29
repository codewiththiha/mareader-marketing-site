# Not making AI slop

> **Status:** v0.1 · **Last updated:** 2026-10-29

Read this before adding a section, a colour or an animation. It is the shortest
document in the repository and the one most likely to be broken.

## What the phenomenon actually is

The critique that formed in 2025–26 has a consistent description. Models predict
the most probable next token, so with an under-specified brief they return the
statistical centre of the training data — and the centre of "modern web UI" is a
very specific look: Inter, an indigo-to-violet gradient, a centred hero with one
button, three rounded cards with line icons. Anthropic's own guidance calls it
_distributional convergence_ and says the fix is direction, not a better model:
a named aesthetic, explicit defaults to avoid, a token system, and a screenshot
loop so the author can see what was built. The purple has a traceable origin —
Tailwind's `bg-indigo-500` examples saturated tutorials, models learned them, and
AI-built purple sites became more training data. The grey 1px card border and the
`--radius: 0.625rem` come from shadcn's defaults the same way: they were designed
to be neutral, and neutral is what comes back when nobody decides.

Sources worth reading, in order of usefulness:

- 925studios, _AI Slop Web Design_ (2026) — the checklist of tells and fixes.
- Anthropic's design guidance as summarised by TechArion, _Why AI Websites Look
  the Same_ (2026) — direction over prompting, and the screenshot loop.
- superdesign, _Why AI Design Looks Generic_ (2026) — "distributional
  convergence", and why over-designing in compensation is worse.
- Unicode/Communicode, _Why beautiful websites don't convert_ (2026) — the tells
  are a symptom; the real failure is not knowing what the reader needs.

The second-order failure matters more here: **over-designing to escape the
label**. Gradients on every section, parallax, custom cursors, animated
backgrounds. That is not a direction either; it is noise with a different
signature. This site answers with restraint plus one memorable idea (the reader
window you can repaint), not with more effects.

## The tells, and what this site does instead

| Tell                                                                | Here                                                                                                |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Inter for headlines; one weight everywhere                          | Newsreader for display, Inter for interface; weights 300–500 with a real scale                      |
| Violet→blue gradient hero, gradient text                            | Flat warm paper; one blue, used only for actions; no gradient on any text or surface                |
| Glassmorphism, frosted cards, glow                                  | No blur, no translucency; hairline borders and one flat "raised" paper                              |
| Centred hero with a badge above the H1                              | Left-aligned hero at the page's own measure; the only thing above the H1 is the header              |
| Three identical feature cards in a row                              | A two-column list of six, separated by hairlines, each with its own animated mark                   |
| Uniform 16 px radius, identical padding everywhere                  | Four radii with different jobs; a 4 px spacing scale; sections separated by rules, not cards        |
| Every card carries a coloured left border or a soft shadow          | No coloured borders; shadows only under the drawn window                                            |
| Emoji as icons, or a generic icon set                               | Six icons drawn for this repo, each animated to say something about its feature                     |
| "Seamless", "powerful", "unleash", "supercharge", "the future of X" | Concrete claims with numbers and sources: 12 MiB, four panes, no webview                            |
| Fake social proof: invented logos, testimonials, star counts        | None, deliberately. The product is 0.0.5 and the page says so                                       |
| A dark mode added by reflex                                         | Both themes designed together, with light as the paper the app is named for                         |
| Scroll-jacking, parallax, cursor effects                            | A 12 px reveal and hover states. Nothing moves while you read                                       |
| Decorative circles, blobs, mesh shapes                              | None. Circles appear only as a feature's mark and as a tint swatch, where a circle means "pick one" |
| Endless animation loops                                             | Every animation is a transition on a state the reader caused                                        |

## The rules, in the imperative

1. **Commit to one direction and write it down.** `docs/design.md` is that
   document. A new element either fits it or changes it deliberately, with a
   sentence saying why.
2. **Cap the palette.** One action colour, one paper family, one gilt accent for
   the book. If a new colour is needed, a token must be retired in the same
   commit.
3. **Pick the type pairing and keep it.** Two faces, one scale. No third face for
   a "hero accent".
4. **Borderless by default.** A box earns a border when it groups something a
   person can act on (a wallet card, the donate strip). Sections do not.
5. **Measure contrast; never estimate it.** `tools/shot.mjs` runs axe on every
   route in both themes and fails the run on a violation.
6. **Motion explains, it does not decorate.** If an animation does not tell the
   reader what happened or what this feature is, cut it.
7. **Claims carry sources.** A number gets a footnote in the section that makes
   it, naming the app's own measurement.
8. **Say the limits.** The home page has a section called "What v0.0.5 doesn't
   do". It is the highest-trust element on the page and it costs nothing.
9. **Look at it.** Every change is screenshotted in both themes and at a phone
   width, and read by a human against this document.

## A test for a new section

Before it ships, answer these in the pull request:

- What question does this section answer that the reader is already asking?
- Which earlier section does it repeat, and why is the repeat cheaper than a
  link?
- Which tokens does it use, and does it need any that are not there?
- What does it look like at 390 px, in dark mode, with reduced motion on?
- If it were deleted, what would the reader get wrong?
