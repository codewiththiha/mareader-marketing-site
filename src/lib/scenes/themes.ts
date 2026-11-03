import { bookById } from "@/lib/content";
import { DEFAULT_LOOK, lerp, presetLook, type Appearance } from "@/lib/palette";
import type { Step } from "@/lib/timeline";
import type { PaneSpec, Tree } from "@/lib/window/tree";

export interface ThemesState {
  look: Appearance;
  popover: boolean;
  pressing: string | null;
}

export const THEMES_TREE: Tree = { axis: "h", ratio: 0.5, a: "A", b: "B" };
export const THEMES_PANES: PaneSpec[] = [
  { id: "A", book: bookById("moby") },
  { id: "B", book: bookById("einstein") },
];

export const THEMES_INITIAL: ThemesState = { look: DEFAULT_LOOK, popover: false, pressing: null };

export const THEMES_STEPS: Step<ThemesState>[] = [
  { at: 0, caption: "A book and a scanned paper, side by side. Both wear the window's look.", focus: null, zoom: 1 },
  {
    at: 1800,
    set: { popover: true },
    focus: "popover",
    zoom: 1.45,
    caption: "Appearance holds presets, mode, hue, strength, texture and grain. A change lands on the next frame.",
  },
  { at: 4200, set: { pressing: "sepia" }, focus: "preset-sepia", zoom: 2.4 },
  {
    at: 4500,
    set: { pressing: null, look: presetLook("sepia") },
    focus: null,
    zoom: 1,
    caption: "Sepia. The chrome, the book and the PDF take the same tint.",
  },
  {
    at: 7200,
    focus: "hue",
    zoom: 2.2,
    caption: "Drag the hue. Every page follows while the slider moves; nothing is re-rendered.",
    tween: { dur: 1700, apply: (p, s) => ({ look: { ...s.look, hue: lerp(34, 200, p), strength: 23 } }) },
  },
  {
    at: 9900,
    focus: "mode",
    zoom: 2.2,
    set: { look: { ...presetLook("sepia"), hue: 200, base: "dark" } },
    caption: "Dark inverts the PDF smartly and re-inks the book. The hue stays.",
  },
  { at: 11800, focus: null, zoom: 1 },
  {
    at: 13400,
    focus: "texture-group",
    zoom: 1.9,
    set: { look: { ...presetLook("sepia"), hue: 200, base: "dark", texture: "paper", textureOpacity: 85, textureScale: 110 } },
    caption: "Lay real paper over it. Add film grain.",
  },
  {
    at: 15000,
    focus: "grain-group",
    zoom: 1.9,
    set: {
      look: {
        ...presetLook("sepia"),
        hue: 200,
        base: "dark",
        texture: "paper",
        textureOpacity: 85,
        textureScale: 110,
        noise: "static",
        noiseIntensity: 18,
      },
    },
  },
  { at: 16500, focus: "save-look", zoom: 2.6, caption: "Save it. Your looks sit beside the classics, as many as you like." },
  { at: 18000, focus: null, zoom: 1, caption: "One look, every page." },
];

export const THEMES_DURATION = 19600;
