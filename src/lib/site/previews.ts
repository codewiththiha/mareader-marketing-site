/** Home previews: the copy, and the live frames the app mock plays for each. */
import type { LookRef } from "$lib/looks";
import { WIN_H, WIN_W, type WinState } from "$lib/window/state";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Frame {
  st: Partial<WinState>;
  rect?: Rect;
  ms: number;
}

export interface Preview {
  id: string;
  chapter: string;
  title: string;
  body: string;
  details: string[];
  alt: string;
  poster: number;
  rect: Rect;
  frames: Frame[];
}

const FULL: Rect = { x: 0, y: 0, w: WIN_W, h: WIN_H };
const SHELF: Rect = { x: 430, y: 26, w: 1104, h: 690 };
const WORD: Rect = { x: 864, y: 214, w: 672, h: 420 };
const DIALOG: Rect = { x: 520, y: 140, w: 736, h: 460 };
const KEYS: Rect = { x: 520, y: 168, w: 736, h: 460 };
const VOICES: Rect = { x: 520, y: 118, w: 736, h: 460 };
const DESK: Rect = { x: 500, y: 272, w: 1024, h: 640 };

const wear = (l: LookRef): Partial<WinState> => ({ looks: [l, l, l, l], chrome: l, preset: l });

export const HERO = {
  rect: FULL,
  poster: 3,
  frames: [
    { st: { panes: 4, titlebar: true }, ms: 2400 },
    { st: { panes: 4, titlebar: true, perPane: true, looks: ["home", "night", "home", "home"] }, ms: 2100 },
    { st: { panes: 4, titlebar: true, perPane: true, looks: ["home", "night", "green", "home"] }, ms: 2100 },
    { st: { panes: 4, titlebar: true, perPane: true, looks: ["sepia", "night", "green", "rose"] }, ms: 3600 },
  ] as Frame[],
};

export const PREVIEWS: Preview[] = [
  {
    id: "appearance",
    chapter: "Make it yours",
    title: "Limitless themes.",
    body: "Tint it, texture it, add grain. Find a look you love and save it as your own, for PDF and EPUB alike.",
    details: ["Presets & custom colours", "PDF + EPUB"],
    alt: "The appearance popover cycling saved looks over a book page.",
    poster: 2,
    rect: SHELF,
    frames: [
      { st: { titlebar: true, lit: "palette" }, ms: 1100 },
      { st: { titlebar: true, popover: "themes" }, ms: 1500 },
      { st: { titlebar: true, popover: "themes", ...wear("sepia") }, ms: 1500 },
      { st: { titlebar: true, popover: "themes", ...wear("night") }, ms: 1500 },
      { st: { titlebar: true, popover: "themes", ...wear("green") }, ms: 1500 },
      { st: { titlebar: true, popover: "themes", ...wear("rose") }, ms: 1500 },
      { st: { titlebar: true, popover: "themes", ...wear("home") }, ms: 1700 },
    ],
  },
  {
    id: "panes",
    chapter: "Make room",
    title: "More books, more room.",
    body: "Read side by side in up to four panes. Keep the same look throughout, or give each pane its own.",
    details: ["Up to four panes", "Per-pane themes"],
    alt: "Panes splitting from two up to four books, then taking separate looks.",
    poster: 6,
    rect: FULL,
    frames: [
      { st: { panes: 2, titlebar: true }, ms: 1700 },
      { st: { panes: 3, titlebar: true }, ms: 1400 },
      { st: { panes: 4, titlebar: true }, ms: 1900 },
      { st: { panes: 4, titlebar: true, popover: "split", lit: "perpane" }, ms: 1400 },
      { st: { panes: 4, titlebar: true, popover: "split", perPane: true, lit: "perpane" }, ms: 1300 },
      { st: { panes: 4, titlebar: true, popover: "split", perPane: true, looks: ["home", "night", "green", "rose"] }, ms: 2300 },
      { st: { panes: 4, titlebar: true, perPane: true, looks: ["sepia", "night", "parchment", "cinema"] }, ms: 2600 },
    ],
  },
  {
    id: "dictionary",
    chapter: "Stay in the story",
    title: "A dictionary that reads the page.",
    body: "Select a word and discover its meaning in context, without breaking the flow. Bring the model you trust.",
    details: ["Context-aware", "Your choice of model"],
    alt: "A word marked on the page, then explained by a card beside it.",
    poster: 2,
    rect: WORD,
    frames: [
      { st: { titlebar: true }, ms: 1300 },
      { st: { titlebar: true, marks: true }, ms: 1600 },
      { st: { titlebar: true, marks: true, card: true }, ms: 4200 },
    ],
  },
  {
    id: "models",
    chapter: "Your models, your rules",
    title: "Bring your own model.",
    body: "Use Ollama, LM Studio or Apple's on-device models. Prefer a cloud provider? Bring your own keys and let the rotator handle the rest.",
    details: ["Local models", "Key rotation"],
    alt: "Provider keys taking turns in settings, then the local model list.",
    poster: 0,
    rect: KEYS,
    frames: [
      { st: { settings: "keys", lit: "keys" }, rect: KEYS, ms: 3600 },
      { st: { settings: "local", lit: "local" }, rect: DIALOG, ms: 3600 },
    ],
  },
  {
    id: "voice",
    chapter: "Listen a little longer",
    title: "Read aloud, fully offline.",
    body: "Download a voice once, then listen anywhere. Follow along as Mareader highlights the words for you.",
    details: ["Offline voices", "Read-along highlighting"],
    alt: "A voice downloading, then the player lighting phrases on the page.",
    poster: 2,
    rect: VOICES,
    frames: [
      { st: { settings: "voices", voice: "downloading" }, rect: VOICES, ms: 3600 },
      { st: { settings: "voices", voice: "ready" }, rect: VOICES, ms: 1900 },
      { st: { pride: "ch6", titlebar: true, player: true }, rect: DESK, ms: 5200 },
    ],
  },
];
