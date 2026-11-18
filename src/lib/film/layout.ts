/** Where captions sit and how the camera frames each step, per viewport. */
import { WIN_H, WIN_W, type R } from "$lib/window/state";
import type { Step } from "./steps";

const NAV = 60;
const GUIDE = 64;
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
  const landscape = (vw >= 820 || (vw >= 540 && vh <= 500)) && vw / vh >= 1.12;
  const short = vh < 690;
  const compactWide = landscape && vh < 520;
  if (s.hero) {
    if (compactWide) {
      const tw = vw * 0.46;
      return {
        landscape,
        side: "left",
        text: { x: 0, y: NAV, w: tw, h: vh - NAV - GUIDE },
        fa: { x: tw + 8, y: NAV, w: vw - tw - 24, h: vh - NAV - GUIDE },
        focus: s.focus,
        maxS: 1,
      };
    }
    const top = NAV + (landscape ? clamp(vh * 0.055, 18, 60) : 12);
    const th = landscape ? clamp(vh * 0.4, short ? 235 : 300, 390) : short ? clamp(vh * 0.4, 234, 300) : clamp(vh * 0.47, 330, 420);
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
    const tw = clamp(vw * (compactWide ? 0.39 : 0.33), compactWide ? 195 : 330, 520);
    const gap = clamp(vw * 0.035, 28, 72);
    const top = NAV + (compactWide ? 8 : 28);
    const bottom = compactWide ? GUIDE : 36;
    const captionY = compactWide ? NAV : 0;
    const captionH = compactWide ? vh - NAV - GUIDE : vh;
    const faW = vw - padX - tw - gap - padX * 0.5;
    const text: R = side === "left" ? { x: padX, y: captionY, w: tw, h: captionH } : { x: vw - padX - tw, y: captionY, w: tw, h: captionH };
    const fa: R =
      side === "left"
        ? { x: padX + tw + gap, y: top, w: faW, h: vh - top - bottom }
        : { x: padX * 0.5, y: top, w: faW, h: vh - top - bottom };
    return { landscape, side, text, fa, focus, maxS: s.maxS ?? 1.6 };
  }
  const th = clamp(vh * 0.31, 196, 300);
  const bottomH = th + (short ? 32 : 0);
  const maxS = s.maxS ?? 1.2;
  const make = (side: "top" | "bottom"): Layout => {
    const text: R =
      side === "bottom" ? { x: 22, y: vh - bottomH, w: vw - 44, h: bottomH - GUIDE } : { x: 22, y: NAV + 8, w: vw - 44, h: th };
    const fa: R =
      side === "bottom"
        ? { x: 12, y: NAV + 10, w: vw - 24, h: Math.max(40, vh - bottomH - NAV - 14) }
        : { x: 12, y: NAV + 8 + th, w: vw - 24, h: Math.max(40, vh - NAV - 8 - th - (short ? GUIDE : 16)) };
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

export function camOf(L: Layout) {
  const scale = Math.min(L.fa.w / L.focus.w, L.fa.h / L.focus.h, L.maxS);
  return {
    scale,
    x: L.fa.x + L.fa.w / 2 - (L.focus.x + L.focus.w / 2) * scale,
    y: L.fa.y + L.fa.h / 2 - (L.focus.y + L.focus.h / 2) * scale,
  };
}

export function maskFor(side: Side, L: Layout, vw: number, vh: number, fill = "#000") {
  if (side === "left") {
    const a = L.text.x + L.text.w * 0.92;
    const b = L.fa.x + 18;
    return `linear-gradient(90deg, ${fill} 0px, ${fill} ${a}px, transparent ${b}px)`;
  }
  if (side === "right") {
    const a = vw - (L.text.x + L.text.w * 0.08);
    const b = vw - (L.fa.x + L.fa.w) + 18;
    return `linear-gradient(270deg, ${fill} 0px, ${fill} ${a}px, transparent ${b}px)`;
  }
  if (side === "bottom") {
    const a = vh - L.text.y - 6;
    return `linear-gradient(0deg, ${fill} 0px, ${fill} ${a}px, transparent ${a + 40}px)`;
  }
  const a = L.text.y + L.text.h + 6;
  return `linear-gradient(180deg, ${fill} 0px, ${fill} ${a}px, transparent ${a + 40}px)`;
}
