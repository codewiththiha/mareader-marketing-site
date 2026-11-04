/** Hand-picked reader-facing highlights in sections; full notes stay on GitHub. */
import type { Release } from "./releases-type";

export interface Highlight {
  lead: string;
  rest: string;
}

export interface Section {
  title: string;
  items: Highlight[];
}

const h = (lead: string, rest: string): Highlight => ({ lead, rest });

const CURATED: Record<string, Section[] | undefined> = {
  "v0.0.5": [
    {
      title: "What’s new",
      items: [
        h("Read along.", "Words light up as they’re spoken, timed to the voice itself."),
        h("A player over the page.", "Compact and resizable; it grows into a card when the words scroll away."),
        h("Start anywhere.", "Right-click a word, or select text, to read from exactly there."),
        h("Reading carries on.", "Speech is prepared ahead, so sentences follow without a gap, and a reopened book resumes."),
        h("Two more voices, sooner.", "Phonon reads text as written, Kokoro Tiny is a 92 MB build, and voices start over a second sooner."),
      ],
    },
    {
      title: "Fixes",
      items: [
        h("PDFs read smoothly.", "Wrapped lines join into paragraphs, so read-aloud and reflow behave."),
        h("Your accent, your colour.", "A narrated book’s highlight takes your accent colour, and notifications make room for menus."),
      ],
    },
  ],
  "v0.0.4": [
    {
      title: "What’s new",
      items: [
        h("Read aloud.", "Any book, from where you right-click, with sentences lighting up and pages turning."),
        h("Neural voices, offline.", "Kokoro, Piper and Kitten download in Settings and run on your computer alone."),
        h("How words sound.", "Pronunciation on dictionary and AI cards, American or British, spoken aloud."),
        h("Books reload themselves.", "Save a book elsewhere and the open copy refreshes, keeping your place."),
      ],
    },
    {
      title: "Fixes",
      items: [
        h("A real Windows icon.", "Explorer, the Start menu and the taskbar show Mareader’s own mark, not a generic one."),
        h("Notes keep their pictures.", "Imported Markdown holds its images even after the originals are gone."),
      ],
    },
  ],
  "v0.0.3": [
    {
      title: "What’s new",
      items: [
        h("Page AI.", "Summarize, translate or simplify any page, right where you are reading."),
        h("Results kept with the book.", "They return next time, laid into the pages in your own type."),
        h("Continuous mode.", "Finished pages ask for the next few ahead, so translating reads without stops."),
        h("Library from the sidebar.", "Move, rename and nest shelves, and import books, all from one tree."),
      ],
    },
    {
      title: "Fixes",
      items: [h("Clean erasing.", "Erasing a book’s data also removes its AI pages and Explain answers from disk.")],
    },
  ],
  "v0.0.2": [
    {
      title: "What’s new",
      items: [
        h("A real dictionary.", "A full page, or a floating card that follows you and folds to a pill."),
        h("Notes and bookmarks.", "Write on any highlight, bookmark pages, export the lot."),
        h("A rebuilt library.", "A grid you arrange by dragging, with shelves, multi-select and watched folders."),
        h("Reading, smoother.", "Pan by empty space, lift and move panes, open pictures large, footnotes in place."),
        h("A new icon.", "An open book whose edges draw an M, with one line highlighted."),
      ],
    },
  ],
  "v0.0.1": [
    {
      title: "In the first build",
      items: [
        h("A calm reader.", "PDF, EPUB, text and Markdown, native — up to four panes, each with its own theme."),
        h("Words that help.", "Highlights, offline dictionaries, CEFR word levels and AI Explain."),
        h("Full keyboard control.", "Everything reachable without the mouse, plus a shortcut sheet."),
      ],
    },
    {
      title: "Good to know",
      items: [
        h("Each system asks once.", "The build isn’t signed yet, so macOS and Windows confirm the first open; the release page shows how."),
      ],
    },
  ],
};

export function highlightsFor(release: Release): Section[] {
  const curated = CURATED[release.tag];
  if (curated) return curated;
  const intro = release.body.split(/\n\n/)[0]?.trim() ?? "";
  return intro ? [{ title: "", items: [{ lead: "", rest: intro }] }] : [];
}
