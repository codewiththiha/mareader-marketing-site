/** Window state model: what the demo window shows, and pane geometry. */
import type { LookRef } from "$lib/looks";

export interface WinState {
  panes: 1 | 2 | 3 | 4;
  looks: [LookRef, LookRef, LookRef, LookRef];
  chrome: LookRef;
  pride: "opening" | "ch6";
  sidebar: boolean;
  titlebar: boolean;
  popover: null | "themes" | "split";
  preset: LookRef;
  perPane: boolean;
  marks: boolean;
  card: boolean;
  settings: null | "keys" | "local" | "voices";
  player: boolean;
  lit: string | null;
  voice: "downloading" | "ready";
}

export const DEFAULT_STATE: WinState = {
  panes: 1,
  looks: ["home", "home", "home", "home"],
  chrome: "home",
  pride: "opening",
  sidebar: false,
  titlebar: false,
  popover: null,
  preset: "home",
  perPane: false,
  marks: false,
  card: false,
  settings: null,
  player: false,
  lit: null,
  voice: "downloading",
};

export const WIN_W = 1536;
export const WIN_H = 960;
export const SIDEBAR_W = 368;

export interface R {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function paneRects(n: number, side: number): R[] {
  const x0 = side;
  const W = WIN_W - side;
  const H = WIN_H;
  const half = Math.round(W / 2);
  const rw = W - half;
  const P: R = n === 1 ? { x: x0, y: 0, w: W, h: H } : { x: x0, y: 0, w: half, h: H };
  const A: R =
    n === 1 ? { x: x0 + W, y: 0, w: 0, h: H } : n === 2 ? { x: x0 + half, y: 0, w: rw, h: H } : { x: x0 + half, y: 0, w: rw, h: H / 2 };
  const V: R =
    n <= 2
      ? { x: x0 + half, y: H, w: rw, h: 0 }
      : n === 3
        ? { x: x0 + half, y: H / 2, w: rw, h: H / 2 }
        : { x: x0 + half, y: H / 2, w: rw / 2, h: H / 2 };
  const C: R = n <= 3 ? { x: x0 + W, y: H / 2, w: 0, h: H / 2 } : { x: x0 + half + rw / 2, y: H / 2, w: rw / 2, h: H / 2 };
  return [P, A, V, C];
}
