import { MOBY } from "@/lib/content";
import type { WordAnswer } from "@/lib/overlays/types";
import type { Step } from "@/lib/timeline";

export interface DictState {
  selected: boolean;
  bar: boolean;
  pressed: "ai" | null;
  marked: boolean;
  card: "none" | "waiting" | "partial" | "ready";
  progress: number;
}

export const ANSWER: WordAnswer = {
  word: "circumambulate",
  pos: "verb",
  level: "C2",
  meaning: "To walk all the way around something, slowly or with ceremony; here, to wander the city's edge on an idle afternoon.",
  synonyms: ["walk round", "circle", "encircle", "perambulate"],
  usages: ["The pilgrims circumambulate the shrine three times.", "We circumambulated the lake before supper."],
  by: "Ollama · qwen3",
};

const WORD = "Circumambulate";
export const para3 = MOBY.paragraphs[2] ?? "";
export const para4 = MOBY.paragraphs[3] ?? "";
export const word = para4.slice(0, WORD.length);
export const rest = para4.slice(WORD.length);

export const DICT_INITIAL: DictState = { selected: false, bar: false, pressed: null, marked: false, card: "none", progress: 0 };

export const DICT_STEPS: Step<DictState>[] = [
  { at: 0, caption: "A word stops you.", focus: null, zoom: 1 },
  {
    at: 1400,
    set: { selected: true, bar: true },
    focus: "selection-bar",
    zoom: 2.1,
    caption: "Select it. Copy, AI Dictionary, Look up, highlights, Read aloud: one quiet bar.",
  },
  { at: 3800, set: { pressed: "ai" } },
  {
    at: 4100,
    set: { bar: false, pressed: null, selected: false, marked: true, card: "waiting" },
    focus: "word-card",
    zoom: 1.75,
    caption: "The word is marked where it stands, and its card opens under it.",
  },
  {
    at: 5600,
    set: { card: "partial" },
    caption: "Meaning in this context, synonyms, usages, streamed from the model you chose.",
    tween: { dur: 2800, apply: (p) => ({ progress: p }) },
  },
  { at: 8700, set: { card: "ready", progress: 1 } },
  { at: 11000, set: { card: "none" }, focus: null, zoom: 1, caption: "The mark stays. Click it any time and the card returns." },
];

export const DICT_DURATION = 13400;
