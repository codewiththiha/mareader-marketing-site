export interface Step<S> {
  at: number;
  caption?: string;
  focus?: string | null;
  zoom?: number;
  set?: Partial<S>;
  tween?: { dur: number; apply: (p: number, s: S) => Partial<S> };
}

export interface Playhead<S> {
  state: S;
  caption: string;
  focus: string | null;
  zoom: number;
  index: number;
}

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export function playhead<S>(steps: Step<S>[], initial: S, t: number): Playhead<S> {
  let state = { ...initial };
  let caption = "";
  let focus: string | null = null;
  let zoom = 1;
  let index = -1;
  steps.forEach((s, i) => {
    if (t < s.at) return;
    index = i;
    if (s.set) state = { ...state, ...s.set };
    if (s.tween) {
      const p = easeInOut(Math.min(1, (t - s.at) / s.tween.dur));
      state = { ...state, ...s.tween.apply(p, state) };
    }
    if (s.caption !== undefined) caption = s.caption;
    if (s.focus !== undefined) focus = s.focus;
    if (s.zoom !== undefined) zoom = s.zoom;
  });
  return { state, caption, focus, zoom, index };
}
