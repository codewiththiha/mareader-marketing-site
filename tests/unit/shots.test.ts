/** Reel script: state merges, crop choice and loop timing. */
import { describe, expect, it } from "vitest";
import { PACE, SHOTS, cycleMs, durationAt, focusOf, modeOf, needsOf, stateOf } from "../../src/lib/reel/shots";

const index = (id: string) => SHOTS.findIndex((s) => s.id === id);

describe("stateOf", () => {
  it("layers base then frame over the defaults", () => {
    expect(stateOf(index("keys"), 0).settings).toBe("keys");
    expect(stateOf(index("panes"), 0).panes).toBe(1);
    expect(stateOf(index("panes"), 3).panes).toBe(4);
    expect(stateOf(index("voices"), 1).voice).toBe("ready");
  });

  it("keeps every frame readable", () => {
    SHOTS.forEach((_, i) => {
      SHOTS[i].frames.forEach((__, f) => {
        const st = stateOf(i, f);
        expect(st.panes).toBeGreaterThanOrEqual(1);
        expect(st.panes).toBeLessThanOrEqual(4);
      });
    });
  });
});

describe("shots", () => {
  it("has one take per feature with unique ids", () => {
    expect(new Set(SHOTS.map((s) => s.id)).size).toBe(SHOTS.length);
    expect(SHOTS[0].hero).toBe(true);
    expect(SHOTS.filter((s) => s.hero)).toHaveLength(1);
  });

  it("gives every shot a title, a kicker and at least one frame", () => {
    SHOTS.forEach((s) => {
      expect(s.title.length).toBeGreaterThan(4);
      expect(s.kicker.length).toBeGreaterThan(2);
      expect(s.frames.length).toBeGreaterThan(0);
    });
  });
});

describe("needsOf", () => {
  it("mounts only what a take shows", () => {
    expect(needsOf(index("panes")).panes).toBe(4);
    expect(needsOf(index("perpane")).panes).toBe(4);
    expect(needsOf(index("word")).panes).toBe(1);
    expect(needsOf(index("word")).card).toBe(true);
    expect(needsOf(index("keys")).settings).toBe(true);
    expect(needsOf(index("keys")).popover).toBe(false);
    expect(needsOf(index("themes")).popover).toBe(true);
    expect(needsOf(index("hero")).sidebar).toBe(true);
  });
});

describe("cycleMs", () => {
  it("counts one pass of the loop at the reel's pace", () => {
    const themes = index("themes");
    const shot = SHOTS[themes];
    const frames = shot.ms as number[];
    const fromLoop = frames.slice(shot.loopFrom ?? 0).reduce((a, b) => a + b, 0);
    expect(cycleMs(themes)).toBeCloseTo(fromLoop * PACE);
  });

  it("scales each frame by the pace", () => {
    expect(durationAt(index("themes"), 1)).toBeCloseTo(1900 * PACE);
    expect(durationAt(index("voices"), 0)).toBeCloseTo(3900 * PACE);
    expect(durationAt(index("hero"), 0)).toBeCloseTo(1700 * PACE);
  });
});

describe("focusOf and modeOf", () => {
  it("keeps wide takes whole on a phone", () => {
    for (const id of ["panes", "together", "perpane"]) {
      const i = index(id);
      expect(modeOf(i, true)).toBe("contain");
      expect(focusOf(i, true)).toEqual(focusOf(i, false));
    }
  });

  it("crops close takes on a phone and keeps them wide on a desk", () => {
    const keys = index("keys");
    expect(modeOf(keys, true)).toBe("cover");
    expect(modeOf(keys, false)).toBe("contain");
    expect(focusOf(keys, true).w).toBeLessThan(focusOf(keys, false).w);
  });
});
