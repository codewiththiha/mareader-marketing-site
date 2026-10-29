/**
 * The six things the home page claims. Each one is true of v0.0.5 in the app
 * repository; a claim without a feature behind it belongs in docs/roadmap.md,
 * not here. docs/copy.md § Claims.
 */

export type FeatureId = 'panes' | 'paper' | 'library' | 'voice' | 'study' | 'native';

export interface Feature {
  id: FeatureId;
  title: string;
  body: string;
}

export const features: Feature[] = [
  {
    id: 'panes',
    title: 'Up to four panes',
    body: 'A commentary beside a translation beside the original, each with its own document, zoom and paper. Drag a book to a pane edge to split.',
  },
  {
    id: 'paper',
    title: 'Paper you choose',
    body: 'Light, dark, dim and black, with tints, textures and film grain. The whole window restyles in a frame, and the pages follow without redrawing.',
  },
  {
    id: 'library',
    title: 'A library, not a file list',
    body: 'Shelves, watched folders, covers, and a bookmark ribbon for how far in you are. Read books where they live, or keep a copy.',
  },
  {
    id: 'voice',
    title: 'Read along, offline',
    body: 'Four voice models run on your own computer. Words light up as they are spoken, and nothing you read is sent anywhere.',
  },
  {
    id: 'study',
    title: 'Study without a browser',
    body: 'Highlights and gloss cards, CEFR word levels, offline dictionaries, and page summaries when you want them.',
  },
  {
    id: 'native',
    title: 'Native, and small',
    body: 'Rust, egui and wgpu, with no webview in the middle. A 14-page PDF takes 12 MiB to draw where pdf.js wanted 128.',
  },
];
