/** Pure scroll-pacing, arrival-hold, progress-to-arrow override, and arrow geometry math. */

import type { Step } from "./steps";

export const HERO_COMMIT_PX = 64;
export const READY_COMMIT_PX = 96;
export const BACK_PULL_PX = 96;

/** Mandatory scroll pause when landing on a phase so continuous scrolls never skip scenes. */
export const ARRIVE_UNSEEN_MS = 720;
export const ARRIVE_SEEN_MS = 620;
export const ARRIVE_BACK_MS = 580;

/** Quiet gap proving the user briefly stopped a continuous wheel stream, plus max extra hold. */
export const STREAM_QUIET_MS = 210;
export const STREAM_EXTRA_HOLD_MS = 380;

/** Minimum time early scroll stays on the progress bar before persistent scroll brings back the arrow. */
export const PROGRESS_HOLD_MS = 780;
/** Minimum beat the re-emerged arrow stays visible stretching before it can commit. */
export const ARROW_REVEAL_MS = 260;
export const NUDGE_MIN_PX = 18;
export const OVERRIDE_ARROW_PX = 68;
export const OVERRIDE_COMMIT_PX = 308;

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
  return sign * Math.min(shaped, 150);
}

/** True while a freshly entered phase should stay locked against continuous scrolling. */
export function isArriveLocked(elapsedMs: number, baseLockMs: number, streamBroken: boolean): boolean {
  if (elapsedMs < baseLockMs) return true;
  if (streamBroken) return false;
  return elapsedMs < baseLockMs + STREAM_EXTRA_HOLD_MS;
}

/** Duration in milliseconds of frame `idx` in `step`. */
export function frameDur(step: Step, idx: number): number {
  const m = step.ms;
  if (Array.isArray(m)) return m[Math.min(idx, m.length - 1)] ?? 1800;
  return m ?? 1800;
}

/** Duration in milliseconds of a slide's first-play showcase window. */
export function stepDemoMs(step: Step): number {
  if (step.hero) return 0;
  if (step.frames.length <= 1) {
    if (step.base?.player) return 3100;
    if (step.base?.settings === "keys") return 2200;
    return 1900;
  }
  const end = step.frames.length - 1;
  let sum = 0;
  for (let i = 0; i < end; i++) sum += frameDur(step, i);
  const last = step.frames[end];
  const settle = last.card ? 1150 : Math.min(820, Math.round(frameDur(step, end) * 0.55));
  return sum + settle;
}

export interface ReadyEval {
  pull: number;
  commit: boolean;
}

/** Evaluates forward effort on the hero or a ready phase after arrival settle completes. */
export function evalReady(effort: number, isHero: boolean, arrowShownMs = ARROW_REVEAL_MS): ReadyEval {
  const pos = Math.max(0, effort);
  if (pos <= 0) return { pull: 0, commit: false };
  const need = isHero ? HERO_COMMIT_PX : READY_COMMIT_PX;
  const raw = clamp(pos / need, 0, 1);
  if (!isHero && raw >= 1 && arrowShownMs < ARROW_REVEAL_MS) {
    return { pull: 0.94, commit: false };
  }
  return { pull: raw, commit: raw >= 1 };
}

export interface UnseenEval {
  /** True while the progress bar highlights early scroll ("Still playing"). */
  nudge: boolean;
  /** True only after the progress hold has elapsed and the user keeps scrolling to bring back the arrow. */
  showArrow: boolean;
  /** Normalised 0..1 stretch of the re-emerged upward arrow toward the top crown. */
  pull: number;
  /** Demo playback multiplier (1 at rest, gentle lift during hold, up to 3.6 during arrow stretch). */
  speed: number;
  /** True once the re-emerged upward arrow reaches the top crown. */
  commit: boolean;
}

/** Evaluates first-play scroll: holds on progress first, then brings back the arrow if user persists. */
export function evalUnseen(preEffort: number, holdElapsedMs: number, postEffort: number, arrowShownMs = 0): UnseenEval {
  if (preEffort < NUDGE_MIN_PX && postEffort <= 0) {
    return { nudge: false, showArrow: false, pull: 0, speed: 1, commit: false };
  }

  // Stage 1: mandatory progress-bar hold — absorb scroll, show progress, keep arrow tucked.
  if (holdElapsedMs < PROGRESS_HOLD_MS || postEffort < OVERRIDE_ARROW_PX) {
    const warm = clamp(holdElapsedMs / Math.max(1, PROGRESS_HOLD_MS), 0, 1);
    const tryRatio = clamp(postEffort / Math.max(1, OVERRIDE_ARROW_PX), 0, 1);
    const speed = +(1.15 + warm * 0.25 + tryRatio * 0.3).toFixed(2);
    return { nudge: true, showArrow: false, pull: 0, speed, commit: false };
  }

  // Stage 2: user is still scrolling after the progress hold — morph back to arrow and stretch to top.
  const span = Math.max(1, OVERRIDE_COMMIT_PX - OVERRIDE_ARROW_PX);
  const k = clamp((postEffort - OVERRIDE_ARROW_PX) / span, 0, 1);
  const readyToCommit = postEffort >= OVERRIDE_COMMIT_PX && arrowShownMs >= ARROW_REVEAL_MS;
  const rawPull = 0.1 + Math.pow(k, 0.92) * 0.9;
  const pull = readyToCommit ? 1 : clamp(Math.min(rawPull, postEffort >= OVERRIDE_COMMIT_PX ? 0.94 : 1), 0, 1);
  const speed = +(1.85 + k * 1.75).toFixed(2);
  return { nudge: true, showArrow: true, pull, speed, commit: readyToCommit };
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
    const drift = smoothstep(0.18, 1, c) * 2.8;
    const yTip = yTopBase - drift;
    const yTail = 46.8 - gather * 36.4 - drift;
    const fade = 1 - smoothstep(0.36, 1, c);
    const kiss = Math.sin(clamp(c / 0.56, 0, 1) * Math.PI);
    return {
      yTip,
      yTail: Math.max(yTip + 2.6, yTail),
      yTop: yTopBase - kiss * 1.15,
      topBow: 1.55 + kiss * 1.45,
      wx: 4.15 + 0.85 * gather,
      wy: 5.95 - 1.05 * gather,
      stroke: 1.34 + 0.14 * gather,
      topAlpha: (1 - smoothstep(0.2, 0.94, c)) * 0.9,
      guideAlpha: 0,
      guideY2: yTopBase,
      arrowAlpha: fade,
      rootAlpha: (1 - smoothstep(0, 0.34, c)) * 0.45,
      haloR: 2.8 + smoothstep(0, 0.94, c) * 9.4,
      haloAlpha: Math.sin(Math.pow(c, 0.72) * Math.PI) * 0.58,
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
