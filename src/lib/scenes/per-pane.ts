import { DEFAULT_LOOK, lerp, type Appearance } from "@/lib/palette";
import type { Step } from "@/lib/timeline";

export interface PerPaneState {
  looks: Record<string, Appearance | undefined>;
  themes: boolean;
  active: string;
  pressing: string | null;
}

const own = (hue: number, extra: Partial<Appearance> = {}): Appearance => ({ ...DEFAULT_LOOK, hue, strength: 35, ...extra });

export const PER_PANE_INITIAL: PerPaneState = { looks: {}, themes: false, active: "A", pressing: null };

export const PER_PANE_STEPS: Step<PerPaneState>[] = [
  { at: 0, caption: "Four panes, one look. The popover ends with the split view's switches.", focus: "split-view", zoom: 1.7 },
  { at: 2200, focus: "theme-per-pane", zoom: 2.8 },
  {
    at: 2900,
    set: { themes: true, looks: { B: own(200), C: own(104), D: own(290) } },
    focus: null,
    zoom: 1,
    caption: "Theme per pane: each pane keeps its own colour; grain stays shared.",
  },
  { at: 5600, set: { active: "C" }, focus: "pane-C", zoom: 1.0, caption: "Click a pane and the popover edits that pane alone." },
  { at: 6600, focus: "mode", zoom: 2.2 },
  {
    at: 7300,
    set: { looks: { B: own(200), C: own(104, { base: "dark" }), D: own(290) } },
    caption: "Dark beside light, if that is how you read.",
  },
  { at: 8600, focus: null, zoom: 1 },
  {
    at: 10200,
    set: { active: "D" },
    focus: "hue",
    zoom: 2.2,
    caption: "Each pane's hue, strength and texture are its own.",
    tween: { dur: 1600, apply: (p) => ({ looks: { B: own(200), C: own(104, { base: "dark" }), D: own(lerp(290, 374, p) % 360) } }) },
  },
  { at: 12800, focus: null, zoom: 1, caption: "Four books, four looks, one window." },
];

export const PER_PANE_DURATION = 14800;

export const paneBookId = (active: string): string =>
  active === "A" ? "moby" : active === "B" ? "pride" : active === "C" ? "walden" : "einstein";
