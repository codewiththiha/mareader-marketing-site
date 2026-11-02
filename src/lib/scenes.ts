// scenes — film beats and captions
export type DocKind = "epub-a" | "pdf-a" | "epub-b" | "pdf-b";
export type Fold = "presets" | "colour" | "texture";

export interface Scene {
  id: string;
  caption: string;
  focus: string[];
  focusCompact?: string[];
  zoomMax?: number;
  layout: 1 | 2 | 4;
  themes: string[];
  docs?: DocKind[];
  bar?: boolean;
  popover?: { theme: string; open: Fold[]; perPane?: boolean };
  ai?: "bar" | "card";
  settings?: { tab: "models" | "voices"; step: number };
  player?: boolean;
}

export interface Caption {
  title: string;
  body: string;
  hero?: boolean;
}

export const CAPTIONS: Record<string, Caption> = {
  hero: {
    title: "Read the way your eyes like.",
    body: "A calm reader for PDF and EPUB, with themes, panes, AI and voices that bend to you.",
    hero: true
  },
  themes: {
    title: "Limitless themes.",
    body: "Tint it, texture it, add grain. Dial any look, then save it as your own."
  },
  same: {
    title: "One look, PDF or EPUB.",
    body: "A theme repaints the pages themselves, so scans and reflowed books always match."
  },
  four: {
    title: "Four books, side by side.",
    body: "Open up to four panes. The theme holds across every one of them."
  },
  perPane: {
    title: "Or give each pane its own.",
    body: "Theme per pane, texture per pane. A sunlit study beside a midnight novel."
  },
  ai: {
    title: "A dictionary that reads the page.",
    body: "Select a word and get its meaning in context, from the model you choose."
  },
  models: {
    title: "Bring your own model.",
    body: "Ollama, LM Studio, or Apple's on-device foundation models. No key, and nothing leaves your machine."
  },
  keys: {
    title: "Bring your own keys.",
    body: "Add as many as you like. A built-in rotator takes turns, and sets aside any key that is rate-limited or rejected."
  },
  voices: {
    title: "Read aloud, fully offline.",
    body: "Download a voice once, from Kokoro, Piper, Kitten or Phonon, and listen with no cloud at all."
  }
};

const FOUR: DocKind[] = ["epub-a", "pdf-a", "epub-b", "pdf-b"];

export const SCENES: Scene[] = [
  { id: "intro", caption: "hero", focus: ["window"], layout: 1, themes: ["base"] },
  { id: "themes-sepia", caption: "themes", focus: ["popover", "col0"], focusCompact: ["popover"], layout: 1, themes: ["sepia"], bar: true, popover: { theme: "sepia", open: ["presets", "colour"] } },
  { id: "themes-custom", caption: "themes", focus: ["popover", "col0"], focusCompact: ["popover"], layout: 1, themes: ["ocean"], bar: true, popover: { theme: "ocean", open: ["presets", "colour"] } },
  { id: "themes-parchment", caption: "themes", focus: ["popover", "col0"], focusCompact: ["popover"], layout: 1, themes: ["parchment"], bar: true, popover: { theme: "parchment", open: ["colour", "texture"] } },
  { id: "same-look", caption: "same", focus: ["window"], layout: 2, themes: ["night", "night"], docs: FOUR },
  { id: "four", caption: "four", focus: ["window"], layout: 4, themes: ["night", "night", "night", "night"], docs: FOUR },
  { id: "per-pane-on", caption: "perPane", focus: ["popover", "pane1"], focusCompact: ["popover"], zoomMax: 1.2, layout: 4, themes: ["night", "night", "night", "night"], docs: FOUR, bar: true, popover: { theme: "night", open: ["colour"], perPane: true } },
  { id: "per-pane", caption: "perPane", focus: ["window"], layout: 4, themes: ["sepia", "night", "ocean", "parchment"], docs: FOUR },
  { id: "ai-select", caption: "ai", focus: ["word", "bubble"], zoomMax: 1.6, layout: 1, themes: ["warm"], ai: "bar" },
  { id: "ai-card", caption: "ai", focus: ["word", "bubble"], zoomMax: 1.35, layout: 1, themes: ["warm"], ai: "card" },
  { id: "models", caption: "models", focus: ["settings"], zoomMax: 1.6, layout: 1, themes: ["base"], settings: { tab: "models", step: 0 } },
  { id: "keys-1", caption: "keys", focus: ["keys"], zoomMax: 1.45, layout: 1, themes: ["base"], settings: { tab: "models", step: 1 } },
  { id: "keys-2", caption: "keys", focus: ["keys"], zoomMax: 1.45, layout: 1, themes: ["base"], settings: { tab: "models", step: 2 } },
  { id: "voices", caption: "voices", focus: ["settings"], zoomMax: 1.6, layout: 1, themes: ["base"], settings: { tab: "voices", step: 0 } },
  { id: "player", caption: "voices", focus: ["read", "player"], zoomMax: 1.5, layout: 1, themes: ["warm"], player: true }
];

export const CAPTION_ORDER = Object.keys(CAPTIONS);
