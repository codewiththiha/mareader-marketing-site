/**
 * The release notes as data. Kept from the app's own `docs/releases/*.md`;
 * edit both in the same pass or the site starts telling a different story than
 * the installer. docs/releases.md.
 */

export interface Change {
  title: string;
  body: string;
}

export interface Release {
  version: string;
  headline: string;
  tagline: string;
  changes: Change[];
  fixes?: string[];
  /** The current release, marked once so no page has to guess. */
  current?: boolean;
}

export const releases: Release[] = [
  {
    version: '0.0.5',
    current: true,
    headline: 'Read along',
    tagline:
      'The words light up as they are spoken, a small player sits over the page, and a fourth voice model joins the others.',
    changes: [
      {
        title: 'Read along',
        body: 'Each word lights as it is heard, timed to the voice itself with Kokoro, Piper and Kitten. Light one word, a few, or a whole phrase.',
      },
      {
        title: 'A player over the page',
        body: 'Drag its sides to resize it. When the words being read scroll out of view it grows into a card showing them. It takes on the look of its pane.',
      },
      {
        title: 'Start where you choose',
        body: 'Right-click a word to read from it, select text to read only that, or press the shortcut to carry on from the page.',
      },
      {
        title: 'Skip what reads badly',
        body: 'Tables, lists, figures and asides can be read, skipped, or asked about each time, in EPUB, Markdown and text books.',
      },
      {
        title: 'Phonon, a fourth voice model',
        body: 'English voices that read numbers, money and addresses as written. 64.5 MB, 26 voices, at any speed from 0.5 to 3.',
      },
      {
        title: 'A calmer library',
        body: 'Covers look bound, progress shows as a bookmark ribbon, and a zoom can follow a narrower pane instead of being reset by it.',
      },
    ],
    fixes: [
      'Wrapped PDF lines join into paragraphs, so they read aloud smoothly.',
      'A narrated book takes your accent colour for its highlight, not the book’s.',
      'Notifications move aside for menus and bars that open under them.',
      'Selected items stand out in light tinted themes.',
    ],
  },
  {
    version: '0.0.4',
    headline: 'Read aloud',
    tagline:
      'Any book in the system’s voices, or in neural voices that download in Settings and run on your own machine.',
    changes: [
      {
        title: 'Read aloud',
        body: 'Reading starts where you right-click or press the shortcut. Each sentence lights as it is read, and pages turn by themselves.',
      },
      {
        title: 'Three voice models',
        body: 'Kokoro in seven languages, Piper for speed, Kitten from 24 MB. All offline; nothing is sent anywhere.',
      },
      {
        title: 'How a word sounds',
        body: 'Word cards show pronunciation as IPA or an easy respelling, American or British, with a speaker to hear it.',
      },
      {
        title: 'Books reload when saved elsewhere',
        body: 'Re-export a PDF or rebuild an EPUB in another app and the open book reloads by itself, staying where you were.',
      },
    ],
    fixes: ['A book’s own boxes, margins and rules survive the reflow.'],
  },
  {
    version: '0.0.3',
    headline: 'Page AI',
    tagline:
      'Summarize, translate or simplify any page, and keep the result with the book on the same paper.',
    changes: [
      {
        title: 'Page AI',
        body: 'Right-click a page for a summary, a translation or a simpler retelling. Numbered bubbles switch between the result and the original.',
      },
      {
        title: 'A result becomes a page',
        body: 'In a book, a result is laid out in your own type, over as many pages as it needs. Turning it off gives the book its pages back.',
      },
      {
        title: 'Continuous mode',
        body: 'After a short stay on a finished page the next few are asked ahead, so the translation is there when you arrive.',
      },
    ],
    fixes: ['Erasure also removes a book’s AI pages and answers from disk.'],
  },
  {
    version: '0.0.2',
    headline: 'Dictionary, notes and a rebuilt library',
    tagline:
      'A dictionary that floats, notes on highlights, and a home screen you arrange by dragging.',
    changes: [
      {
        title: 'The dictionary',
        body: 'A full page or a floating card over the page: move it, resize it, fold it to a pill. Languages mode bridges through English.',
      },
      {
        title: 'Notes and bookmarks',
        body: 'Write a note on any highlight, list notes by chapter, bookmark pages, export everything.',
      },
      {
        title: 'A rebuilt library',
        body: 'Shelves you make by stacking books, multi-select, a list view, watched folders, and links between duplicates.',
      },
    ],
  },
  {
    version: '0.0.1',
    headline: 'The first build',
    tagline:
      'A calm reader for PDF, EPUB, plain text and Markdown, native on macOS, Windows and Linux, with no webview.',
    changes: [
      {
        title: 'Four ways to see a page',
        body: 'Single, spread, vertical and horizontal, with zoom, fit, outline, thumbnails, search and links.',
      },
      {
        title: 'Panes',
        body: 'Up to four, each with its own document, zoom and theme, in one window.',
      },
      {
        title: 'Paper and ink',
        body: 'Light, dark, dim and black papers, tints, textures, film grain and presets you can save.',
      },
      {
        title: 'Study tools',
        body: 'Highlights, gloss cards, offline dictionaries, CEFR word levels and Explain.',
      },
    ],
  },
];

export const current = releases.find((release) => release.current) ?? releases[0];
