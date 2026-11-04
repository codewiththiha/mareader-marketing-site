/** Hand-picked reader-facing highlights; full notes stay on GitHub. */
import type { Release } from "./releases-type";

export interface Highlight {
  lead: string;
  rest: string;
}

const CURATED: Record<string, Highlight[] | undefined> = {
  "v0.0.5": [
    { lead: "Read along.", rest: "Words light up as they’re spoken, timed to the voice itself." },
    { lead: "A player over the page.", rest: "Compact and resizable; it grows into a card when the words scroll away." },
    { lead: "Start anywhere.", rest: "Right-click a word, or select text, to read from exactly there." },
    { lead: "Phonon, a fourth voice.", rest: "26 English voices that read numbers, money and addresses as written." },
  ],
  "v0.0.4": [
    { lead: "Read aloud.", rest: "Any book, from where you right-click, with sentences lighting up and pages turning." },
    { lead: "Neural voices, offline.", rest: "Kokoro, Piper and Kitten download in Settings and run on your computer alone." },
    { lead: "How words sound.", rest: "Pronunciation on dictionary and AI cards, American or British, spoken aloud." },
    { lead: "Books reload themselves.", rest: "Save a book elsewhere and the open copy refreshes, keeping your place." },
  ],
  "v0.0.3": [
    { lead: "Page AI.", rest: "Summarize, translate or simplify any page, right where you are reading." },
    { lead: "Results kept with the book.", rest: "They return next time, laid into the pages in your own type." },
    { lead: "Organize with AI.", rest: "Let a model sort loose books onto shelves; pause or discard a run any time." },
    { lead: "Library from the sidebar.", rest: "Move, rename and nest shelves, and import books, all from one tree." },
  ],
  "v0.0.2": [
    { lead: "A real dictionary.", rest: "A full page, or a floating card that follows you and folds to a pill." },
    { lead: "Notes and bookmarks.", rest: "Write on any highlight, bookmark pages, export the lot." },
    { lead: "A rebuilt library.", rest: "A grid you arrange by dragging, with shelves, multi-select and watched folders." },
    { lead: "A new icon.", rest: "An open book whose edges draw an M, with one line highlighted." },
  ],
  "v0.0.1": [
    { lead: "The first build.", rest: "A calm reader for PDF, EPUB, text and Markdown — native, with no webview." },
    { lead: "Up to four panes.", rest: "Each with its own book and its own theme, side by side." },
    { lead: "Words that help.", rest: "Highlights, offline dictionaries, CEFR word levels and AI Explain." },
    { lead: "Full keyboard control.", rest: "Everything reachable without the mouse, plus a shortcut sheet." },
  ],
};

export function highlightsFor(release: Release): Highlight[] {
  const curated = CURATED[release.tag];
  if (curated) return curated;
  const intro = release.body.split(/\n\n/)[0]?.trim() ?? "";
  return intro ? [{ lead: "", rest: intro }] : [];
}
