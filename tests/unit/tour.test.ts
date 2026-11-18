import { describe, expect, it } from "vitest";
import { canHold, sceneAt, ScrollIntent, stopsFor } from "../../src/lib/film/tour";

const stops = stopsFor(900, 10);

describe("scroll stops", () => {
  it.each([360, 568, 844, 900, 1200])("opens the first demo with a short swipe at %ipx", (height) => {
    const marks = stopsFor(height, 10);
    expect(sceneAt(0, marks)).toBe(0);
    expect(sceneAt(35, marks)).toBe(1);
    expect(sceneAt(marks[3], marks)).toBe(3);
    expect(sceneAt(marks[10] + 1000, marks)).toBe(9);
  });

  it("holds only at the edge of the next scene, never on a deliberate pass", () => {
    expect(canHold(1, 2, stops[2] + 12, stops, false)).toBe(true);
    expect(canHold(1, 2, stops[2] + 12, stops, true)).toBe(false);
    expect(canHold(1, 3, stops[3] + 12, stops, false)).toBe(false);
    expect(canHold(1, 2, stops[2] + 130, stops, false)).toBe(false);
  });
});

describe("scroll intent", () => {
  it("detects a burst of repeated scroll events even when no event is large", () => {
    const scroll = new ScrollIntent();
    expect(scroll.read(100, 30, 900).fast).toBe(false);
    expect(scroll.read(200, 90, 900).fast).toBe(false);
    expect(scroll.read(265, 140, 900).fast).toBe(true);
  });

  it("forgets the burst after a pause or reversal", () => {
    const scroll = new ScrollIntent();
    expect(scroll.read(185, 20, 900).fast).toBe(false);
    expect(scroll.read(260, 260, 900).fast).toBe(false);
    expect(scroll.read(240, 280, 900).delta).toBe(-20);
    expect(scroll.read(425, 290, 900).fast).toBe(false);
  });
});
