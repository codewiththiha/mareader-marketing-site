/** Pure scroll-pacing, demo timing, and living upward-arrow math. */

import type { Step } from "./steps";

export const HERO_COMMIT_PX = 62;
export const READY_COMMIT_PX = 104;
export const HEAVY_COMMIT_PX = 315;
export const NUDGE_MIN_PX = 20;
export const NUDGE_MAX_PX = 112;
export const BACK_PULL_PX = 82;

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function smoothstep(a: number, b: number, x: number): number {
  if (b <= a) return x >= b ? 1 : 0;
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Normalises wheel deltas across pixel trackpads, line wheels, and page wheels. */
export function normalizeWheel(deltaY: number, deltaMode: number, viewH: number): number {
  const raw = deltaMode === 1 ? deltaY * 34 : deltaMode === 2 ? deltaY * Math.max(320, viewH * 0.85) : deltaY;
  if (!Number.isFinite(raw) || raw === 0) return 0;
  const sign = raw < 0 ? -1 : 1;
  const mag = Math.abs(raw);
  const shaped = mag >= 90 && mag <= 135 ? mag * 1.04 : mag;
  return sign * Math.min(shaped, 165);
}

/** Duration in milliseconds of frame `idx` in `step`. */
export function frameDur(step: Step, idx: number): number {
  const m = step.ms;
  if (Array.isArray(m)) return m[Math.min(idx, m.length - 1)] ?? 1800;
  return m ?? 1800;
}

/** Duration in milliseconds required to witness a slide's demo once through. */
export function stepDemoMs(step: Step): number {
  if (step.hero) return 0;
  if (step.frames.length <= 1) {
    if (step.base?.player) return 3100;
    if (step.base?.settings === "keys") return 2100;
    return 0;
  }
  const end = step.frames.length - 1;
  let sum = 0;
  for (let i = 0; i < end; i++) sum += frameDur(step, i);
  const last = step.frames[end];
  const settle = last.card ? 1150 : Math.min(820, Math.round(frameDur(step, end) * 0.55));
  return sum + settle;
}

export interface ForwardEval {
  /** Normalised 0..1 stretch of the upward arrow toward the top crown. */
  pull: number;
  /** True when scrolling early during a slide's very first playthrough. */
  nudge: boolean;
  /** Playback rate multiplier (1 at rest, up to 3.6 under heavy scroll). */
  speed: number;
  /** True once the upward arrow has reached the top threshold. */
  commit: boolean;
}

/** Maps forward scroll effort into arrow stretch, first-play nudge, playback speed, and commit. */
export function evalForward(effort: number, isHero: boolean, firstUnseen: boolean): ForwardEval {
  const pos = Math.max(0, effort);
  if (pos <= 0) return { pull: 0, nudge: false, speed: 1, commit: false };

  if (isHero) {
    const pull = clamp(pos / HERO_COMMIT_PX, 0, 1);
    return { pull, nudge: false, speed: 1, commit: pull >= 1 };
  }

  if (!firstUnseen) {
    const pull = clamp(pos / READY_COMMIT_PX, 0, 1);
    return { pull, nudge: false, speed: 1, commit: pull >= 1 };
  }

  if (pos < NUDGE_MIN_PX) return { pull: 0, nudge: false, speed: 1, commit: false };

  if (pos <= NUDGE_MAX_PX) {
    const t = (pos - NUDGE_MIN_PX) / Math.max(1, NUDGE_MAX_PX - NUDGE_MIN_PX);
    return { pull: 0, nudge: true, speed: +(1 + 0.3 * t).toFixed(2), commit: false };
  }

  const heavy = clamp((pos - NUDGE_MAX_PX) / Math.max(1, HEAVY_COMMIT_PX - NUDGE_MAX_PX), 0, 1);
  const pull = clamp(0.1 + Math.pow(heavy, 0.9) * 0.9, 0, 1);
  const speed = +(1.48 + heavy * 2.12).toFixed(2);
  return { pull, nudge: true, speed, commit: pos >= HEAVY_COMMIT_PX };
}

export interface ArrowGeom {
  yTip: number;
  yTail: number;
  yTop: number;
  topBow: number;
  wx: number;
  wy: number;
  stroke: number;
  topAlpha: number;
  guideAlpha: number;
  guideY2: number;
  arrowAlpha: number;
  rootAlpha: number;
  haloR: number;
  haloAlpha: number;
}

/** Computes living upward-arrow stretch and top-crown release geometry inside a 34x54 slot. */
export function arrowGeometry(pull: number, vel: number, commitT: number, breathe: number): ArrowGeom {
  const p = clamp(pull, 0, 1);
  const c = clamp(commitT, 0, 1);
  const b = clamp(breathe, 0, 1) * (1 - smoothstep(0, 0.2, p)) * (c > 0 ? 0 : 1);

  const yTopBase = 8.4;
  if (c > 0) {
    const gather = 1 - Math.pow(1 - c, 2.55);
    const drift = smoothstep(0.16, 1, c) * 3.6;
    const yTip = yTopBase - drift;
    const yTail = 46.8 - gather * 36.2 - drift;
    const fade = 1 - smoothstep(0.32, 1, c);
    const kiss = Math.sin(clamp(c / 0.52, 0, 1) * Math.PI);
    return {
      yTip,
      yTail: Math.max(yTip + 2.8, yTail),
      yTop: yTopBase - kiss * 1.15,
      topBow: 1.55 + kiss * 1.45,
      wx: 4.15 + 0.85 * gather,
      wy: 5.95 - 1.05 * gather,
      stroke: 1.34 + 0.14 * gather,
      topAlpha: (1 - smoothstep(0.18, 0.92, c)) * 0.9,
      guideAlpha: 0,
      guideY2: yTopBase,
      arrowAlpha: fade,
      rootAlpha: (1 - smoothstep(0, 0.34, c)) * 0.45,
      haloR: 2.8 + smoothstep(0, 0.94, c) * 9.6,
      haloAlpha: Math.sin(Math.pow(c, 0.72) * Math.PI) * 0.56,
    };
  }

  const reach = p < 0.86 ? Math.pow(p / 0.86, 0.88) * 0.89 : 0.89 + smoothstep(0.86, 1, p) * 0.11;
  const breathLift = b * 4.8;
  const yTip = 33.4 - reach * (33.4 - yTopBase) - breathLift;
  const yTail = 45.4 + smoothstep(0, 0.45, p) * 1.4 - b * 0.7;

  const tension = clamp(p * 0.76 + clamp(vel, -1, 2.6) * 0.14, 0, 1);
  const wx = 5.15 - tension * 1.0 - b * 0.2;
  const wy = 4.95 + tension * 1.1 + b * 0.22;
  const stroke = 1.52 - p * 0.18;

  const nearTop = smoothstep(0.7, 1, p);
  const yTop = yTopBase - nearTop * 0.65;
  const topBow = 1.4 + nearTop * 1.1;
  const topAlpha = 0.24 + smoothstep(0.03, 0.82, p) * 0.64 + b * 0.1;

  const gap = yTip - (yTop + 3.2);
  const guideAlpha = gap > 3.5 ? (0.14 + p * 0.16 + b * 0.06) * (1 - smoothstep(0.72, 0.95, p)) : 0;

  return {
    yTip,
    yTail,
    yTop,
    topBow,
    wx,
    wy,
    stroke,
    topAlpha,
    guideAlpha,
    guideY2: Math.max(yTop + 3.4, yTip - 3.6),
    arrowAlpha: 0.86 + p * 0.14 + b * 0.08,
    rootAlpha: smoothstep(0.1, 0.55, p) * 0.46,
    haloR: 2.8,
    haloAlpha: nearTop * 0.24,
  };
}
