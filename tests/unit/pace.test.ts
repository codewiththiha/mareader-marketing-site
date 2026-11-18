/** Scroll pacing, first-play demo guard, and living arrow geometry tests. */
import { describe, expect, it } from "vitest";
import {
  HEAVY_COMMIT_PX,
  HERO_COMMIT_PX,
  NUDGE_MAX_PX,
  READY_COMMIT_PX,
  arrowGeometry,
  evalForward,
  normalizeWheel,
  stepDemoMs,
} from "../../src/lib/film/pace";
import { STEPS } from "../../src/lib/film/steps";

describe("normalizeWheel", () => {
  it("converts pixel, line, and page wheel deltas across sensitivities", () => {
    expect(normalizeWheel(0, 0, 900)).toBe(0);
    expect(normalizeWheel(72, 0, 900)).toBeGreaterThanOrEqual(HERO_COMMIT_PX);
    expect(normalizeWheel(3, 1, 900)).toBeGreaterThanOrEqual(HERO_COMMIT_PX);
    expect(normalizeWheel(1, 2, 900)).toBe(165);
    expect(normalizeWheel(-999, 0, 900)).toBe(-165);
  });
});

describe("evalForward", () => {
  it("commits hero to the first demo in a single swipe or mouse notch", () => {
    const mid = evalForward(HERO_COMMIT_PX * 0.5, true, false);
    expect(mid.commit).toBe(false);
    expect(mid.pull).toBeCloseTo(0.5, 2);
    expect(mid.nudge).toBe(false);

    const hit = evalForward(72, true, false);
    expect(hit.commit).toBe(true);
    expect(hit.pull).toBe(1);
    expect(hit.nudge).toBe(false);
  });

  it("nudges softly on early first-play scroll without skipping the demo", () => {
    const gentle = evalForward(85, false, true);
    expect(gentle.nudge).toBe(true);
    expect(gentle.commit).toBe(false);
    expect(gentle.pull).toBe(0);
    expect(gentle.speed).toBeGreaterThan(1);
  });

  it("accelerates playback and commits cleanly under continued heavy scroll", () => {
    const heavy = evalForward((NUDGE_MAX_PX + HEAVY_COMMIT_PX) / 2, false, true);
    expect(heavy.nudge).toBe(true);
    expect(heavy.speed).toBeGreaterThan(2);
    expect(heavy.pull).toBeGreaterThan(0.45);
    expect(heavy.commit).toBe(false);

    const commit = evalForward(HEAVY_COMMIT_PX, false, true);
    expect(commit.commit).toBe(true);
    expect(commit.pull).toBe(1);
    expect(commit.speed).toBeGreaterThan(3);
  });

  it("never nudges or slows a completed or revisited demo slide", () => {
    const soft = evalForward(80, false, false);
    expect(soft.nudge).toBe(false);
    expect(soft.speed).toBe(1);
    expect(soft.pull).toBeCloseTo(80 / READY_COMMIT_PX, 2);

    const oneSwipe = evalForward(READY_COMMIT_PX, false, false);
    expect(oneSwipe.nudge).toBe(false);
    expect(oneSwipe.commit).toBe(true);
    expect(oneSwipe.pull).toBe(1);
  });
});

describe("stepDemoMs", () => {
  it("times every animated showcase step and keeps static frames immediate", () => {
    expect(stepDemoMs(STEPS[0])).toBe(0);
    const byId = (id: string) => {
      const s = STEPS.find((x) => x.id === id);
      if (!s) throw new Error(`missing step ${id}`);
      return s;
    };
    expect(stepDemoMs(byId("themes"))).toBeGreaterThan(7000);
    expect(stepDemoMs(byId("panes"))).toBeGreaterThan(3000);
    expect(stepDemoMs(byId("together"))).toBeGreaterThan(6000);
    expect(stepDemoMs(byId("perpane"))).toBeGreaterThan(4500);
    expect(stepDemoMs(byId("word"))).toBe(450 + 1150 + 1150);
    expect(stepDemoMs(byId("keys"))).toBe(2100);
    expect(stepDemoMs(byId("local"))).toBe(0);
    expect(stepDemoMs(byId("listen"))).toBe(3100);
    expect(stepDemoMs(byId("voices"))).toBeGreaterThan(4400);
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
