/** The reel: one looping take per feature, each cut to its own screen. */
import type { LookRef } from "$lib/looks";
import { DEFAULT_STATE, WIN_H, WIN_W, type R, type WinState } from "$lib/window/state";

export interface Shot {
  id: string;
  kicker: string;
  title: string;
  body: string;
  hero?: boolean;
  wide?: boolean;
  focus?: R;
  focusP?: R;
  base?: Partial<WinState>;
  frames: Partial<WinState>[];
  ms?: number | number[];
  loop?: boolean;
  loopFrom?: number;
}

export interface Reach {
  panes: 1 | 2 | 3 | 4;
  sidebar: boolean;
  titlebar: boolean;
  popover: boolean;
  settings: boolean;
  player: boolean;
  card: boolean;
}

/** Takes run a touch quicker than the film did, the way a screen capture is sped up. */
export const PACE = 0.74;

const all = (l: LookRef): Partial<WinState> => ({ looks: [l, l, l, l], chrome: l, preset: l });
const FULL: R = { x: 0, y: 0, w: WIN_W, h: WIN_H };
const P = (cx: number, cy: number): R => ({ x: Math.round(cx - 215), y: Math.round(cy - 287), w: 430, h: 573 });
const KEYS: R = { x: 500, y: 356, w: 752, h: 470 };
const LOCAL: R = { x: 500, y: 156, w: 752, h: 470 };
const VOICES: R = { x: 500, y: 250, w: 752, h: 470 };

export const SHOTS: Shot[] = [
  {
    id: "hero",
    kicker: "Mareader",
    hero: true,
    title: "Shaped around the way you read.",
    body: "A calm reader for PDFs and EPUBs. Your colours on every page, four books at once, and AI and voices that stay on your computer.",
    focusP: P(700, 640),
    base: { sidebar: true },
    frames: [{}],
  },
  {
    id: "themes",
    kicker: "Themes",
    title: "Limitless themes, even on a PDF.",
    body: "Pick a mode, turn the hue, lay on real paper or grain, then save it as your own. Every PDF and EPUB follows.",
    focus: { x: 968, y: 22, w: 568, h: 640 },
    focusP: P(1210, 380),
    base: { titlebar: true },
    frames: [
      { ...all("home"), lit: "palette" },
      { ...all("home"), popover: "themes" },
      { ...all("sepia"), popover: "themes" },
      { ...all("night"), popover: "themes" },
      { ...all("green"), popover: "themes" },
      { ...all("rose"), popover: "themes" },
    ],
    ms: [1100, 1900, 1700, 1700, 1700, 1700],
    loop: true,
    loopFrom: 1,
  },
  {
    id: "panes",
    kicker: "Panes",
    title: "Four books, one desk.",
    body: "Open up to four panes side by side: a novel and its notes, a text and its translation.",
    wide: true,
    frames: [{ panes: 1 }, { panes: 2 }, { panes: 3 }, { panes: 4 }],
    ms: [650, 1050, 1050],
  },
  {
    id: "together",
    kicker: "One look",
    title: "Change the look, every pane follows.",
    body: "Scanned PDF, reflowing EPUB, vertical Chinese. One theme, consistent across all four.",
    wide: true,
    base: { panes: 4 },
    frames: [all("home"), all("night"), all("green"), all("black"), all("sepia")],
    ms: 1700,
    loop: true,
  },
  {
    id: "perpane",
    kicker: "Per pane",
    title: "Or give each pane its own.",
    body: "Turn on Theme per pane, and every book keeps a colour and texture of its own.",
    wide: true,
    base: { panes: 4, titlebar: true, popover: "split" },
    frames: [
      { lit: "perpane" },
      { perPane: true, lit: "perpane" },
      { perPane: true, looks: ["home", "night", "home", "home"] },
      { perPane: true, looks: ["home", "night", "green", "home"] },
      { perPane: true, looks: ["home", "night", "green", "rose"] },
      { perPane: true, looks: ["sepia", "night", "green", "rose"] },
    ],
    ms: [1100, 950, 850, 850, 850],
  },
  {
    id: "word",
    kicker: "Dictionary",
    title: "Ask about a word without losing your place.",
    body: "The AI Dictionary explains it in this very sentence, with synonyms and usage, right on the page.",
    focus: { x: 884, y: 226, w: 640, h: 524 },
    focusP: P(1150, 470),
    frames: [{}, { marks: true }, { marks: true, card: true }],
    ms: [450, 1150],
  },
  {
    id: "keys",
    kicker: "AI keys",
    title: "Bring your own keys.",
    body: "Add as many as you like. Requests take turns, a rate-limited key rests, and a rejected one is set aside.",
    focus: KEYS,
    focusP: P(790, 560),
    base: { settings: "keys", lit: "keys" },
    frames: [{}],
  },
  {
    id: "local",
    kicker: "Local AI",
    title: "Or keep the AI on your computer.",
    body: "Run models locally with Ollama or LM Studio, or use Apple Intelligence on Apple silicon. No key needed.",
    focus: LOCAL,
    focusP: P(790, 380),
    base: { settings: "local", lit: "local" },
    frames: [{}],
  },
  {
    id: "listen",
    kicker: "Read aloud",
    title: "Rest your eyes. Keep reading.",
    body: "Read aloud follows every phrase on the page, and turns it for you.",
    focus: { x: 560, y: 196, w: 912, h: 716 },
    focusP: P(1000, 540),
    base: { pride: "ch6", titlebar: true, player: true },
    frames: [{}],
  },
  {
    id: "voices",
    kicker: "Voices",
    title: "Voices that never leave your computer.",
    body: "Download Kokoro, Piper, Kitten or Phonon once. They read offline: no cloud, no account.",
    focus: VOICES,
    focusP: P(790, 470),
    base: { settings: "voices" },
    frames: [{ voice: "downloading" }, { voice: "ready" }],
    ms: [3900],
  },
];

export const WIN_RATIO = WIN_W / WIN_H;

export function stateOf(i: number, f: number): WinState {
  const s = SHOTS[i];
  return { ...DEFAULT_STATE, ...(s.base ?? {}), ...(s.frames[f] ?? {}) };
}

export function needsOf(i: number): Reach {
  const shot = SHOTS[i];
  const states = shot.frames.map((_, f) => stateOf(i, f));
  const some = (test: (s: WinState) => boolean) => states.some(test);
  return {
    panes: Math.max(...states.map((s) => s.panes)) as 1 | 2 | 3 | 4,
    sidebar: some((s) => s.sidebar),
    titlebar: some((s) => s.titlebar),
    popover: some((s) => Boolean(s.popover)),
    settings: some((s) => Boolean(s.settings)),
    player: some((s) => s.player),
    card: some((s) => s.card),
  };
}

/** Milliseconds for one pass of the shot, loop included. */
export function cycleMs(i: number): number {
  const s = SHOTS[i];
  const n = s.frames.length;
  const flat = typeof s.ms === "number" ? s.ms : 1700;
  const list = Array.isArray(s.ms) ? s.ms : Array.from({ length: n }, () => flat);
  const from = s.loop ? (s.loopFrom ?? 0) : 0;
  return list.slice(from).reduce((a, b) => a + b, 0) * PACE;
}

export function durationAt(i: number, f: number): number {
  const s = SHOTS[i];
  const ms = Array.isArray(s.ms) ? (s.ms[f] ?? 1700) : (s.ms ?? 1700);
  return ms * PACE;
}

export function focusOf(i: number, portrait: boolean): R {
  const s = SHOTS[i];
  if (!portrait || s.wide) return s.focus ?? FULL;
  return s.focusP ?? s.focus ?? FULL;
}

/** Wide takes keep the whole window in frame; close takes fill the frame. */
export function modeOf(i: number, portrait: boolean): "contain" | "cover" {
  const s = SHOTS[i];
  return portrait && !s.wide ? "cover" : "contain";
}
