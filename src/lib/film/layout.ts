/** Where captions sit and how the camera frames each step, per viewport. */
import { WIN_H, WIN_W, type R } from "$lib/window/state";
import type { Step } from "./steps";

const NAV = 60;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export type Side = "left" | "right" | "top" | "bottom";

export interface Layout {
  landscape: boolean;
  side: Side;
  text: R;
  fa: R;
  focus: R;
  maxS: number;
}

export function layoutOf(s: Step, vw: number, vh: number): Layout {
  const landscape = vw >= 820 && vw / vh >= 1.12;
  if (s.hero) {
    const top = NAV + (landscape ? clamp(vh * 0.055, 18, 60) : 12);
    const th = landscape ? clamp(vh * 0.4, 300, 390) : clamp(vh * 0.47, 330, 420);
    const pad = landscape ? 48 : 14;
    const sc = Math.min((vw - pad * 2) / WIN_W, landscape ? 0.82 : 1);
    const w = WIN_W * sc;
    return {
      landscape,
      side: "top",
      text: { x: 0, y: top, w: vw, h: th },
      fa: { x: (vw - w) / 2, y: top + th + 6, w, h: WIN_H * sc },
      focus: s.focus,
      maxS: 1,
    };
  }
  const focus = (landscape ? undefined : s.focusP) ?? s.focus;
  if (landscape) {
    const side = s.side ?? (focus.x + focus.w / 2 >= WIN_W / 2 ? "left" : "right");
    const padX = clamp(vw * 0.055, 28, 104);
    const tw = clamp(vw * 0.33, 330, 520);
    const gap = clamp(vw * 0.035, 28, 72);
    const top = NAV + 28;
    const faW = vw - padX - tw - gap - padX * 0.5;
    const text: R = side === "left" ? { x: padX, y: 0, w: tw, h: vh } : { x: vw - padX - tw, y: 0, w: tw, h: vh };
    const fa: R =
      side === "left" ? { x: padX + tw + gap, y: top, w: faW, h: vh - top - 36 } : { x: padX * 0.5, y: top, w: faW, h: vh - top - 36 };
    return { landscape, side, text, fa, focus, maxS: s.maxS ?? 1.6 };
  }
  const th = clamp(vh * 0.31, 196, 300);
  const maxS = s.maxS ?? 1.2;
  const make = (side: "top" | "bottom"): Layout => {
    const text: R = side === "bottom" ? { x: 22, y: vh - th, w: vw - 44, h: th - 20 } : { x: 22, y: NAV + 8, w: vw - 44, h: th };
    const fa: R =
      side === "bottom"
        ? { x: 12, y: NAV + 10, w: vw - 24, h: vh - th - NAV - 14 }
        : { x: 12, y: NAV + 8 + th, w: vw - 24, h: vh - NAV - 8 - th - 16 };
    return { landscape, side, text, fa, focus, maxS };
  };
  const crosses = (L: Layout) => {
    if (!s.zoom) return false;
    const sc = Math.min(L.fa.w / focus.w, L.fa.h / focus.h, maxS);
    const top = L.fa.y + L.fa.h / 2 - (focus.y + focus.h / 2) * sc;
    const bottom = top + WIN_H * sc;
    const t0 = L.text.y;
    const t1 = L.text.y + L.text.h;
    return !((top <= t0 && bottom >= t1) || bottom <= t0 + 12 || top >= t1 - 12);
  };
  const first = s.sideP ?? (focus.y + focus.h / 2 > WIN_H * 0.66 ? "top" : "bottom");
  const L1 = make(first);
  if (!crosses(L1)) return L1;
  const L2 = make(first === "top" ? "bottom" : "top");
  return crosses(L2) ? L1 : L2;
}

export type V5 = [number, number, number, number, number];

export function camOf(L: Layout): V5 {
  const s = Math.min(L.fa.w / L.focus.w, L.fa.h / L.focus.h, L.maxS);
  return [L.focus.x + L.focus.w / 2, L.focus.y + L.focus.h / 2, Math.log(s), L.fa.x + L.fa.w / 2, L.fa.y + L.fa.h / 2];
}

export function maskFor(side: Side, L: Layout, vw: number, vh: number) {
  if (side === "left") {
    const a = L.text.x + L.text.w * 0.92;
    const b = L.fa.x + 18;
    return `linear-gradient(90deg, #000 0px, #000 ${a}px, transparent ${b}px)`;
  }
  if (side === "right") {
    const a = vw - (L.text.x + L.text.w * 0.08);
    const b = vw - (L.fa.x + L.fa.w) + 18;
    return `linear-gradient(270deg, #000 0px, #000 ${a}px, transparent ${b}px)`;
  }
  if (side === "bottom") {
    const a = vh - L.text.y - 6;
    return `linear-gradient(0deg, #000 0px, #000 ${a}px, transparent ${a + 40}px)`;
  }
  const a = L.text.y + L.text.h + 6;
  return `linear-gradient(180deg, #000 0px, #000 ${a}px, transparent ${a + 40}px)`;
}
