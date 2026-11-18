import { describe, expect, it } from "vitest";
import { STEPS } from "../../src/lib/film/steps";
import { TIMELINES, shotState } from "../../src/lib/home/timelines";
import { WIN_H, WIN_W } from "../../src/lib/window/state";

describe("home preview timelines", () => {
  it("provides multiple valid shots and a still poster for every preview", () => {
    for (const timeline of Object.values(TIMELINES)) {
      expect(timeline.shots.length).toBeGreaterThan(1);
      expect(timeline.poster).toBeGreaterThanOrEqual(0);
      expect(timeline.poster).toBeLessThan(timeline.shots.length);
      for (const shot of timeline.shots) {
        expect(STEPS[shot.step]).toBeDefined();
        expect(STEPS[shot.step].frames[shot.frame]).toBeDefined();
        expect(shot.ms).toBeGreaterThan(0);
        expect(shotState(shot).panes).toBeGreaterThanOrEqual(1);
        if ("focus" in shot && shot.focus) {
          expect(shot.focus.x).toBeGreaterThanOrEqual(0);
          expect(shot.focus.y).toBeGreaterThanOrEqual(0);
          expect(shot.focus.x + shot.focus.w).toBeLessThanOrEqual(WIN_W);
          expect(shot.focus.y + shot.focus.h).toBeLessThanOrEqual(WIN_H);
        }
      }
    }
  });

  it("covers each advertised feature with meaningful state changes", () => {
    expect(TIMELINES.panes.shots.map(shotState).map((state) => state.panes)).toContain(4);
    expect(TIMELINES.dictionary.shots.map(shotState).some((state) => state.card)).toBe(true);
    expect(TIMELINES.models.shots.map(shotState).map((state) => state.settings)).toEqual(["local", "keys"]);
    expect(TIMELINES.voice.shots.map(shotState).some((state) => state.player)).toBe(true);
  });
});
