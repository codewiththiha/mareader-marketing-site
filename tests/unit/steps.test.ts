/** Film script: state merges, chapter labels and what each step builds. */
import { describe, expect, it } from "vitest";
import { STEPS, needsOf, stateOf } from "../../src/lib/film/steps";

describe("stateOf", () => {
  it("layers base then frame over the defaults", () => {
    expect(stateOf(6, 0).settings).toBe("keys");
    expect(stateOf(2, 0).panes).toBe(1);
    expect(stateOf(2, 3).panes).toBe(4);
    expect(stateOf(9, 1).voice).toBe("ready");
  });

  it("keeps every frame inside its step", () => {
    STEPS.forEach((s, i) => {
      s.frames.forEach((_, f) => {
        expect(stateOf(i, f).panes).toBeGreaterThanOrEqual(1);
      });
    });
  });
});

describe("kickers", () => {
  it("gives every chapter a short label", () => {
    STEPS.forEach((s) => {
      expect(s.kicker.length).toBeGreaterThan(2);
    });
    expect(new Set(STEPS.map((s) => s.kicker)).size).toBe(STEPS.length);
  });
});

describe("needsOf", () => {
  it("builds only the panes a step opens", () => {
    expect(needsOf(0).panes).toBe(1);
    expect(needsOf(2).panes).toBe(4);
    expect(needsOf(3).panes).toBe(4);
  });

  it("mounts chrome only where it is shown", () => {
    expect(needsOf(0).settings).toBe(false);
    expect(needsOf(0).popover).toBe(false);
    expect(needsOf(1).popover).toBe(true);
    expect(needsOf(6).settings).toBe(true);
    expect(needsOf(8).player).toBe(true);
  });

  it("asks every step for at least one pane", () => {
    STEPS.forEach((_, i) => {
      expect(needsOf(i).panes).toBeGreaterThanOrEqual(1);
    });
  });
});
