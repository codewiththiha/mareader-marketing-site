import { stateOf } from "$lib/film/steps";
import type { R, WinState } from "$lib/window/state";

export interface Shot {
  step: number;
  frame: number;
  ms: number;
  focus?: R;
  override?: Partial<WinState>;
}

export interface Timeline {
  shots: Shot[];
  poster: number;
}

const themeFocus = { x: 800, y: 0, w: 736, h: 650 };
const wordFocus = { x: 750, y: 140, w: 786, h: 600 };
const modelFocus = { x: 480, y: 90, w: 820, h: 600 };
const voiceFocus = { x: 480, y: 80, w: 820, h: 600 };
const playerFocus = { x: 300, y: 285, w: 1080, h: 675 };
const noPopover: Partial<WinState> = { popover: null };

export const TIMELINES = {
  hero: {
    poster: 0,
    shots: [
      { step: 4, frame: 5, ms: 2600, override: noPopover },
      { step: 3, frame: 1, ms: 2200 },
      { step: 3, frame: 2, ms: 2200 },
      { step: 3, frame: 4, ms: 2200 },
      { step: 4, frame: 3, ms: 2000, override: noPopover },
      { step: 4, frame: 4, ms: 2000, override: noPopover },
    ],
  },
  appearance: {
    poster: 1,
    shots: [
      { step: 1, frame: 1, ms: 1600, focus: themeFocus },
      { step: 1, frame: 2, ms: 2200, focus: themeFocus },
      { step: 1, frame: 3, ms: 2200, focus: themeFocus },
      { step: 1, frame: 4, ms: 2200, focus: themeFocus },
      { step: 1, frame: 5, ms: 2200, focus: themeFocus },
    ],
  },
  panes: {
    poster: 8,
    shots: [
      { step: 2, frame: 0, ms: 1400 },
      { step: 2, frame: 1, ms: 1700 },
      { step: 2, frame: 2, ms: 1700 },
      { step: 2, frame: 3, ms: 2000 },
      { step: 3, frame: 1, ms: 2000 },
      { step: 3, frame: 2, ms: 2000 },
      { step: 4, frame: 2, ms: 1600, override: noPopover },
      { step: 4, frame: 3, ms: 1600, override: noPopover },
      { step: 4, frame: 5, ms: 2600, override: noPopover },
    ],
  },
  dictionary: {
    poster: 2,
    shots: [
      { step: 5, frame: 0, ms: 1500, focus: wordFocus },
      { step: 5, frame: 1, ms: 1800, focus: wordFocus },
      { step: 5, frame: 2, ms: 5000, focus: wordFocus },
    ],
  },
  models: {
    poster: 0,
    shots: [
      { step: 7, frame: 0, ms: 3200, focus: modelFocus },
      { step: 6, frame: 0, ms: 7000, focus: modelFocus },
    ],
  },
  voice: {
    poster: 2,
    shots: [
      { step: 9, frame: 0, ms: 4000, focus: voiceFocus },
      { step: 9, frame: 1, ms: 2500, focus: voiceFocus },
      { step: 8, frame: 0, ms: 10000, focus: playerFocus },
    ],
  },
} satisfies Record<string, Timeline>;

export type TimelineId = keyof typeof TIMELINES;

export function shotState(shot: Shot): WinState {
  return { ...stateOf(shot.step, shot.frame), ...shot.override };
}
