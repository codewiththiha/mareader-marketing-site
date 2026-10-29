# Psychology of the page

> **Status:** v0.1 · **Last updated:** 2026-10-29

What a reader decides in the first ten seconds, and what the page does about it.
This is the document to argue with before rearranging a section; it is the reason
the order is what it is.

## What the visitor is actually deciding

A person arrives from a link, a release page or a search for "calm pdf reader".
In order, they ask:

1. **Is this for a file I have?** (PDF and EPUB, on my machine) — answered in the
   first line and the H1.
2. **Will it run here?** (my system) — answered by the hero button naming their
   system, and by the plain list under it.
3. **Is it a toy?** (memory, panes, library, reading aloud) — answered by the
   window, then by measured numbers.
4. **What's the catch?** (signing, sync, Linux ARM) — answered _before_ they
   scroll to the download, in their own section.
5. **Who made it, and is it free?** — answered in the footer and the donate strip.

The page is ordered in exactly that sequence: hero → features → the appearance
lab → numbers → limits → downloads → donate.

## One door, then a corridor

Every landing page teaches a lesson in the first click. This one offers a single
primary action — **Download for {your system}** — and, one line below, the honest
alternatives (`v0.0.5 · 64-bit · deb · Every file`). Not four equal buttons: a
reader choosing between four downloads has been handed the product's work.

- The label names _their_ system, because a button that already knows is a
  button that was meant for them.
- On a Mac where the browser will not say which chip, the button keeps its
  default (Apple silicon) and a two-segment switch appears beside it. Choosing
  Intel rewrites the link in place — no page reload, no second screen.
- Phones get the whole list instead of a file, because the app is a desktop one
  and a phone that downloads a `.deb` has been misled.

## Show, then tell, then prove

- **Show**: the drawn reader window, in the app's colours, is the largest thing
  after the headline. Two pages side by side is the product's boldest idea, so it
  is the first visual.
- **Tell**: six claims, each one sentence, each a capability a reader can picture.
- **Prove**: three numbers with their source, and one interactive section where
  the reader changes the paper and watches it change. Interaction converts
  scepticism into familiarity faster than any paragraph; that is why the
  appearance lab exists rather than a screenshot strip.
- **Then be honest**: the limits section. Saying "not notarised yet" before
  someone meets the warning dialog converts a surprise (bad) into a caveat
  (trustworthy). It also filters out the people this build will annoy, which
  saves them a download and the project a bug report.

## Reciprocity, without a hook

The page gives away the things a SaaS page would hold back: every file name and
its install command, the checksums, the build instructions, the memory audit, the
limits. Nothing is gated, nothing asks for an email. The donate strip comes after
the download and reads "If it earns a place in your day" — a condition, not a
demand, and it names what the money buys (signing certificates, weeks of work)
rather than appealing to generosity.

## Memorable, not busy

Interacting is what makes a page remembered; animation is only the pencil.

- **The window is repaintable.** Three controls in the appearance lab change the
  thing the rest of the page is about. That is the moment a reader remembers.
- **Icons behave like their feature.** The panes separate, the page's lines draw,
  the voice bars ripple. Each is one gesture, on hover, and stops.
- **State is local and legible.** A copy button becomes a check where the finger
  already is; a menu closes on the page you chose; the theme disc travels.
- **Nothing loops.** A page that animates at rest is a page that makes reading
  tiring, which is the opposite of the product.

## What was deliberately left out

| Left out                                              | Why                                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Testimonials, logos, star counts                      | There is one released version and no user data to quote. Inventing proof is the fastest way to lose the reader who checks |
| A newsletter or "join the waitlist"                   | Nothing to send; the product ships on GitHub                                                                              |
| A comparison table against other readers              | It invites a fight the product does not need, and naming competitors ages badly                                           |
| A big "Get started" hero with a form                  | The action is a download, one press away                                                                                  |
| Autoplaying video of the app                          | 8 MB to say what a drawing says in 30 kB                                                                                  |
| A cookie banner                                       | Nothing is tracked; there is nothing to consent to                                                                        |
| Countdown timers, "only X left", scroll-progress bars | Pressure tactics for a free, MIT-licensed program                                                                         |

## Copy rules that follow from this

- Name the reader's situation before the feature: "the book you are halfway
  through", not "advanced navigation".
- Numbers are specific and awkward on purpose: 12 MiB against 128 MiB, four
  panes, a 64.5 MB voice model. Round numbers read as marketing.
- No sentence may claim something the interface cannot show in two clicks.
- British spelling in prose; American in identifiers and in the product's own
  filenames (never rewrite a filename).
