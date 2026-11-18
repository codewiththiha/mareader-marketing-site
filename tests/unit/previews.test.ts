import { describe, expect, it } from "vitest";
import { HERO, PREVIEWS, type Rect } from "../../src/lib/site/previews";
import { WIN_H, WIN_W } from "../../src/lib/window/state";

const STAGE = WIN_W / WIN_H;

describe("home previews", () => {
  it("keeps every id unique", () => {
    expect(new Set(PREVIEWS.map((p) => p.id)).size).toBe(PREVIEWS.length);
  });

  it("holds a poster inside each frame list", () => {
    for (const p of [...PREVIEWS, { id: "hero", poster: HERO.poster, frames: HERO.frames }]) {
      expect(p.frames.length).toBeGreaterThan(0);
      expect(p.poster).toBeGreaterThanOrEqual(0);
      expect(p.poster).toBeLessThan(p.frames.length);
    }
  });

  it("crops in the stage ratio so nothing is letterboxed", () => {
    const rects = [HERO.rect, ...PREVIEWS.map((p) => p.rect), ...PREVIEWS.flatMap((p) => p.frames.map((f) => f.rect))];
    for (const r of rects.filter((r): r is Rect => r !== undefined)) {
      expect(r.w / r.h).toBeCloseTo(STAGE, 2);
    }
  });

  it("keeps every crop on the window", () => {
    const rects = [HERO.rect, ...PREVIEWS.map((p) => p.rect), ...PREVIEWS.flatMap((p) => p.frames.map((f) => f.rect))];
    for (const r of rects.filter((r): r is Rect => r !== undefined)) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.w).toBeLessThanOrEqual(WIN_W);
      expect(r.y + r.h).toBeLessThanOrEqual(WIN_H);
    }
  });

  it("gives every feature its copy and a dwell per frame", () => {
    for (const p of PREVIEWS) {
      expect(p.title.length).toBeGreaterThan(8);
      expect(p.body.length).toBeGreaterThan(40);
      expect(p.details.length).toBeGreaterThan(1);
      expect(p.alt.length).toBeGreaterThan(20);
      for (const f of p.frames) expect(f.ms).toBeGreaterThanOrEqual(800);
    }
  });
});
