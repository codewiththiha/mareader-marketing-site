/** Scroll pacing, phase-arrival hold, progress-to-arrow override, and arrow geometry tests. */
import { describe, expect, it } from "vitest";
import {
  ARRIVE_SEEN_MS,
  ARRIVE_UNSEEN_MS,
  ARROW_REVEAL_MS,
  HERO_COMMIT_PX,
  OVERRIDE_ARROW_PX,
  OVERRIDE_COMMIT_PX,
  PROGRESS_HOLD_MS,
  READY_COMMIT_PX,
  STREAM_EXTRA_HOLD_MS,
  arrowGeometry,
  evalReady,
  evalUnseen,
  isArriveLocked,
  normalizeWheel,
  stepDemoMs,
} from "../../src/lib/film/pace";
import { STEPS } from "../../src/lib/film/steps";

describe("normalizeWheel", () => {
  it("converts pixel, line, and page wheel deltas across sensitivities", () => {
    expect(normalizeWheel(0, 0, 900)).toBe(0);
    expect(normalizeWheel(72, 0, 900)).toBeGreaterThanOrEqual(HERO_COMMIT_PX);
    expect(normalizeWheel(3, 1, 900)).toBeGreaterThanOrEqual(HERO_COMMIT_PX);
    expect(normalizeWheel(1, 2, 900)).toBe(150);
    expect(normalizeWheel(-999, 0, 900)).toBe(-150);
  });
});

describe("isArriveLocked", () => {
  it("pauses scrolling at every phase and extends hold for unbroken continuous streams", () => {
    expect(isArriveLocked(0, ARRIVE_UNSEEN_MS, true)).toBe(true);
    expect(isArriveLocked(ARRIVE_UNSEEN_MS - 10, ARRIVE_UNSEEN_MS, true)).toBe(true);
    expect(isArriveLocked(ARRIVE_UNSEEN_MS + 10, ARRIVE_UNSEEN_MS, true)).toBe(false);

    // Continuous stream without pausing stays locked for the extra settle window.
    expect(isArriveLocked(ARRIVE_SEEN_MS + 50, ARRIVE_SEEN_MS, false)).toBe(true);
    expect(isArriveLocked(ARRIVE_SEEN_MS + STREAM_EXTRA_HOLD_MS + 10, ARRIVE_SEEN_MS, false)).toBe(false);
  });
});

describe("evalReady", () => {
  it("commits hero in a single swipe and lets re-emerged phase arrows visibly stretch", () => {
    expect(evalReady(HERO_COMMIT_PX * 0.5, true).commit).toBe(false);
    expect(evalReady(72, true)).toEqual({ pull: 1, commit: true });

    // Right as progress transforms back into the arrow, clamp just below apex so the arrow shows.
    const fresh = evalReady(READY_COMMIT_PX + 20, false, 40);
    expect(fresh.commit).toBe(false);
    expect(fresh.pull).toBeCloseTo(0.94, 2);

    const ready = evalReady(READY_COMMIT_PX, false, ARROW_REVEAL_MS);
    expect(ready).toEqual({ pull: 1, commit: true });
  });
});

describe("evalUnseen", () => {
  it("holds strictly on the progress bar during early scroll without showing the arrow", () => {
    const start = evalUnseen(90, 0, 0, 0);
    expect(start.nudge).toBe(true);
    expect(start.showArrow).toBe(false);
    expect(start.pull).toBe(0);
    expect(start.commit).toBe(false);

    const midHold = evalUnseen(90, PROGRESS_HOLD_MS - 40, 200, 300);
    expect(midHold.nudge).toBe(true);
    expect(midHold.showArrow).toBe(false);
    expect(midHold.pull).toBe(0);
    expect(midHold.commit).toBe(false);
  });

  it("brings back the arrow only after the hold when the user persists, then commits at the top", () => {
    const crumb = evalUnseen(90, PROGRESS_HOLD_MS + 50, OVERRIDE_ARROW_PX - 10, 0);
    expect(crumb.showArrow).toBe(false);
    expect(crumb.commit).toBe(false);

    const reveal = evalUnseen(90, PROGRESS_HOLD_MS + 80, (OVERRIDE_ARROW_PX + OVERRIDE_COMMIT_PX) / 2, 120);
    expect(reveal.showArrow).toBe(true);
    expect(reveal.pull).toBeGreaterThan(0.45);
    expect(reveal.speed).toBeGreaterThan(2.5);
    expect(reveal.commit).toBe(false);

    // Even at full effort, let the returned arrow finish revealing before committing.
    const tooSoon = evalUnseen(90, PROGRESS_HOLD_MS + 100, OVERRIDE_COMMIT_PX + 40, 60);
    expect(tooSoon.showArrow).toBe(true);
    expect(tooSoon.pull).toBeCloseTo(0.94, 2);
    expect(tooSoon.commit).toBe(false);

    const commit = evalUnseen(90, PROGRESS_HOLD_MS + 400, OVERRIDE_COMMIT_PX, ARROW_REVEAL_MS);
    expect(commit.showArrow).toBe(true);
    expect(commit.pull).toBe(1);
    expect(commit.commit).toBe(true);
  });
});

describe("stepDemoMs", () => {
  it("gives every non-hero showcase phase a clear first-play window", () => {
    expect(stepDemoMs(STEPS[0])).toBe(0);
    for (const s of STEPS.slice(1)) {
      expect(stepDemoMs(s)).toBeGreaterThanOrEqual(1900);
    }
  });
});

describe("arrowGeometry", () => {
  it("stretches monotonically up to the top crown and gathers smoothly on commit", () => {
    const rest = arrowGeometry(0, 0, 0, 0);
    const half = arrowGeometry(0.5, 0.8, 0, 0);
    const top = arrowGeometry(1, 1.2, 0, 0);
    expect(half.yTip).toBeLessThan(rest.yTip);
    expect(top.yTip).toBeLessThan(half.yTip);
    expect(top.yTip).toBeCloseTo(8.4, 1);
    expect(top.yTail - top.yTip).toBeGreaterThan((rest.yTail - rest.yTip) * 2.8);

    const kiss = arrowGeometry(1, 0, 0.35, 0);
    const end = arrowGeometry(1, 0, 1, 0);
    expect(kiss.haloAlpha).toBeGreaterThan(0.2);
    expect(kiss.yTail).toBeLessThan(top.yTail);
    expect(end.arrowAlpha).toBe(0);
    expect(end.yTail).toBeLessThan(kiss.yTail);
  });
});
