/** The film's steps: captions, camera focus and the frame timeline each step plays. */
import type { LookRef } from "$lib/looks";
import { DEFAULT_STATE, WIN_H, WIN_W, type R, type WinState } from "$lib/window/state";
import type { Reach } from "$lib/window/reach";

export type { R };

export interface Step {
  id: string;
  kicker: string;
  title: string;
  body: string;
  hero?: boolean;
  focus: R;
  focusP?: R;
  side?: "left" | "right";
  sideP?: "top" | "bottom";
  zoom?: boolean;
  maxS?: number;
  base?: Partial<WinState>;
  frames: Partial<WinState>[];
  ms?: number | number[];
  loop?: boolean;
  loopFrom?: number;
  weight?: number;
}

const all = (l: LookRef): Partial<WinState> => ({ looks: [l, l, l, l], chrome: l, preset: l });
const FULL: R = { x: 0, y: 0, w: WIN_W, h: WIN_H };

export const STEPS: Step[] = [
  {
    id: "hero",
    kicker: "The reel",
    hero: true,
    weight: 0.7,
    title: "Shaped around the way you read.",
    body: "A calm reader for PDFs and EPUBs. Your colours on every page, four books at once, and AI and voices that stay on your computer.",
    focus: FULL,
    base: { sidebar: true },
    frames: [{}],
  },
  {
    id: "themes",
    kicker: "Themes",
    title: "Limitless themes, even on a PDF.",
    body: "Pick a mode, turn the hue, lay on real paper or grain, then save it as your own. Every PDF and EPUB follows.",
    focus: { x: 968, y: 22, w: 568, h: 640 },
    focusP: { x: 1150, y: 50, w: 372, h: 600 },
    zoom: true,
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
    focus: FULL,
    frames: [{ panes: 1 }, { panes: 2 }, { panes: 3 }, { panes: 4 }],
    ms: [650, 1050, 1050],
  },
  {
    id: "together",
    kicker: "One look",
    title: "Change the look, every pane follows.",
    body: "Scanned PDF, reflowing EPUB, vertical Chinese. One theme, consistent across all four.",
    focus: FULL,
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
    focus: FULL,
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
    focusP: { x: 896, y: 232, w: 372, h: 470 },
    zoom: true,
    frames: [{}, { marks: true }, { marks: true, card: true }],
    ms: [450, 1150],
  },
  {
    id: "keys",
    kicker: "AI keys",
    title: "Bring your own keys.",
    body: "Add as many as you like. Requests take turns, a rate-limited key rests, and a rejected one is set aside.",
    focus: { x: 534, y: 268, w: 712, h: 540 },
    focusP: { x: 544, y: 440, w: 700, h: 360 },
    zoom: true,
    base: { settings: "keys", lit: "keys" },
    frames: [{}],
  },
  {
    id: "local",
    kicker: "Local AI",
    title: "Or keep the AI on your computer.",
    body: "Run models locally with Ollama or LM Studio, or use Apple Intelligence on Apple silicon. No key needed.",
    focus: { x: 534, y: 150, w: 712, h: 500 },
    focusP: { x: 544, y: 392, w: 700, h: 262 },
    zoom: true,
    base: { settings: "local", lit: "local" },
    frames: [{}],
  },
  {
    id: "listen",
    kicker: "Read aloud",
    title: "Rest your eyes. Keep reading.",
    body: "Read aloud follows every phrase on the page, and turns it for you.",
    focus: { x: 560, y: 196, w: 912, h: 716 },
    focusP: { x: 520, y: 380, w: 700, h: 520 },
    zoom: true,
    base: { pride: "ch6", titlebar: true, player: true },
    frames: [{}],
  },
  {
    id: "voices",
    kicker: "Voices",
    title: "Voices that never leave your computer.",
    body: "Download Kokoro, Piper, Kitten or Phonon once. They read offline: no cloud, no account.",
    focus: { x: 534, y: 130, w: 712, h: 420 },
    focusP: { x: 544, y: 150, w: 700, h: 380 },
    zoom: true,
    base: { settings: "voices" },
    frames: [{ voice: "downloading" }, { voice: "ready" }],
    ms: [3900],
  },
];

export function stateOf(i: number, f: number): WinState {
  const s = STEPS[i];
  return { ...DEFAULT_STATE, ...(s.base ?? {}), ...(s.frames[f] ?? {}) };
}

export function needsOf(i: number): Reach {
  const all = [STEPS[i].base ?? {}, ...STEPS[i].frames].map((f) => ({ ...DEFAULT_STATE, ...f }));
  const any = (f: (s: WinState) => boolean) => all.some(f);
  return {
    panes: Math.max(...all.map((s) => s.panes)) as Reach["panes"],
    sidebar: any((s) => s.sidebar),
    titlebar: any((s) => s.titlebar),
    popover: any((s) => s.popover !== null),
    player: any((s) => s.player),
    settings: any((s) => s.settings !== null),
    card: any((s) => s.card),
  };
}
