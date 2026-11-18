/** Frame maths for the reel: how one shot's focus rect sits inside the player. */
import { WIN_H, WIN_W, type R } from "$lib/window/state";

export interface Fit {
  k: number;
  x: number;
  y: number;
}

const MAX_K = 1.5;
const MIN_K = 0.3;

function axis(size: number, room: number, centre: number, k: number) {
  const span = size * k;
  if (span <= room) return (room - span) / 2;
  return Math.min(0, Math.max(room - span, room / 2 - centre * k));
}

/** contain keeps the whole subject in frame; cover fills it and crops the edges. */
export function fitTo(width: number, height: number, focus: R, mode: "contain" | "cover" = "contain"): Fit {
  if (width <= 0 || height <= 0) return { k: 0, x: 0, y: 0 };
  const sx = width / focus.w;
  const sy = height / focus.h;
  const k = Math.min(MAX_K, Math.max(MIN_K, mode === "contain" ? Math.min(sx, sy) : Math.max(sx, sy)));
  return {
    k,
    x: axis(WIN_W, width, focus.x + focus.w / 2, k),
    y: axis(WIN_H, height, focus.y + focus.h / 2, k),
  };
}
