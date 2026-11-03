// SPACE is a word separator; Svelte trims literal whitespace at element edges, so it stays an expression.
import { MOBY, SPOKEN } from "@/lib/content";
import type { Step } from "@/lib/timeline";

export interface ReadState {
  player: "none" | "pill" | "card";
  playing: boolean;
  word: number;
  offset: number;
  settings: boolean;
  kokoro: "offer" | "downloading" | "ready";
  kokoroP: number;
  highlight: "word" | "few" | "phrase";
}

export const SPACE = " ";
export const WORDS = SPOKEN.split(SPACE);
export const SENTENCE_END = 3;
export const TAIL = (MOBY.paragraphs[0] ?? "").slice(SPOKEN.length + 1);
export const TAIL_PARAGRAPHS = MOBY.paragraphs.slice(1);
export const SENTENCE_WORDS = WORDS.slice(SENTENCE_END);
export const READ_TOTAL = 12 * 60 + 40;

export const READ_INITIAL: ReadState = {
  player: "none",
  playing: false,
  word: -1,
  offset: 0,
  settings: false,
  kokoro: "offer",
  kokoroP: 0,
  highlight: "word",
};

export const READ_STEPS: Step<ReadState>[] = [
  { at: 0, caption: "Right-click a word, or press ⌘⇧R, and reading begins there.", focus: null, zoom: 1 },
  {
    at: 1300,
    set: { player: "pill", playing: true },
    focus: "player",
    zoom: 1.9,
    caption: "A compact player sits over the page: steps, play, a track with the time left, speed.",
  },
  {
    at: 3600,
    focus: "spoken",
    zoom: 1.55,
    caption: "Words light up as they're heard, timed to the voice itself.",
    tween: { dur: 7400, apply: (p) => ({ word: Math.floor(p * 26) }) },
  },
  { at: 8200, tween: { dur: 1100, apply: (p) => ({ offset: p * 300 }) } },
  {
    at: 9400,
    set: { player: "card" },
    focus: "player",
    zoom: 1.45,
    caption: "When the words leave the view, the player grows into a card and keeps reading along.",
  },
  {
    at: 13200,
    set: { settings: true },
    focus: null,
    zoom: 1,
    caption: "The voices live on your computer. Kokoro, Piper, Kitten and Phonon, 24 to 327 MB each. No cloud, ever.",
  },
  { at: 15400, set: { kokoro: "downloading" }, focus: "voice-kokoro", zoom: 1.7, tween: { dur: 2600, apply: (p) => ({ kokoroP: p }) } },
  { at: 18300, set: { kokoro: "ready" }, caption: "Download once. Pick a voice and a speed from 0.5× to 3×." },
  {
    at: 20000,
    focus: "read-along",
    zoom: 2.0,
    set: { highlight: "few" },
    caption: "Light a word, a few, or a whole phrase; phrases break where the voice pauses.",
  },
  { at: 22600, focus: null, zoom: 1 },
];

export const READ_DURATION = 24200;
