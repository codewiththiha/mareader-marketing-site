/** Frame maths: the window always covers the player, never shows the page behind. */
import { describe, expect, it } from "vitest";
import { fitTo } from "../../src/lib/reel/frame";
import { WIN_H, WIN_W } from "../../src/lib/window/state";

const FULL = { x: 0, y: 0, w: WIN_W, h: WIN_H };
const KEYS = { x: 500, y: 356, w: 752, h: 470 };

describe("fitTo", () => {
  it("shows the whole window when the player has the window's shape", () => {
    const f = fitTo(1536, 960, FULL);
    expect(f.k).toBeCloseTo(1);
    expect(f.x).toBeCloseTo(0);
    expect(f.y).toBeCloseTo(0);
  });

  it("centres the subject with contain", () => {
    const w = 1200;
    const h = 750;
    const f = fitTo(w, h, KEYS);
    const shownW = w / f.k;
    const shownH = h / f.k;
    expect(shownW).toBeGreaterThanOrEqual(KEYS.w - 0.01);
    expect(shownH).toBeGreaterThanOrEqual(KEYS.h - 0.01);
    expect(-f.x / f.k).toBeLessThanOrEqual(KEYS.x + 0.01);
    expect(-f.y / f.k).toBeLessThanOrEqual(KEYS.y + 0.01);
  });

  it("fills the player with cover", () => {
    const f = fitTo(390, 520, KEYS, "cover");
    expect(390 / f.k).toBeLessThanOrEqual(KEYS.w + 0.01);
    expect(520 / f.k).toBeLessThanOrEqual(KEYS.h + 0.01);
  });

  it("fills the player with cover at any size", () => {
    const cases: [number, number][] = [
      [1200, 750],
      [390, 520],
      [390, 244],
      [1920, 1080],
      [800, 800],
    ];
    for (const [w, h] of cases) {
      for (const focus of [FULL, KEYS]) {
        const f = fitTo(w, h, focus, "cover");
        expect(f.x).toBeLessThanOrEqual(0.01);
        expect(f.y).toBeLessThanOrEqual(0.01);
        expect(f.x + WIN_W * f.k).toBeGreaterThanOrEqual(w - 0.01);
        expect(f.y + WIN_H * f.k).toBeGreaterThanOrEqual(h - 0.01);
      }
    }
  });

  it("keeps the window centred in the player with contain", () => {
    const cases: [number, number][] = [
      [1200, 750],
      [390, 244],
      [1920, 1080],
    ];
    for (const [w, h] of cases) {
      const f = fitTo(w, h, FULL, "contain");
      expect(f.x + (WIN_W * f.k) / 2).toBeCloseTo(w / 2, 0);
      expect(f.y + (WIN_H * f.k) / 2).toBeCloseTo(h / 2, 0);
    }
  });

  it("holds the zoom inside sane limits and survives an unmeasured frame", () => {
    expect(fitTo(1200, 750, { x: 700, y: 400, w: 40, h: 30 }).k).toBeLessThanOrEqual(1.5);
    expect(fitTo(1200, 750, FULL).k).toBeGreaterThanOrEqual(0.3);
    expect(fitTo(0, 0, FULL)).toEqual({ k: 0, x: 0, y: 0 });
  });
});
