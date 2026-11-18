import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { beatsFor, DemoClock } from "../../src/lib/film/playback";
import { STEPS } from "../../src/lib/film/steps";

beforeEach(() => vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] }));
afterEach(() => vi.useRealTimers());

describe("demo playback", () => {
  it("preserves the authored beats and holds the last frame briefly", () => {
    expect(beatsFor(STEPS[0])).toEqual([]);
    expect(beatsFor(STEPS[1])).toEqual([1100, 3000, 4700, 6400, 8100, 9800]);
    expect(beatsFor(STEPS[5])).toEqual([450, 1600, 2220]);
    expect(beatsFor(STEPS[8])[1]).toBe(2800);
  });

  it("finishes one pass and does no more work after the last frame", () => {
    const beat = vi.fn();
    const finish = vi.fn();
    const demo = new DemoClock([400, 800, 1250], beat, finish);
    demo.resume();
    vi.advanceTimersByTime(10_000);
    expect(beat.mock.calls).toEqual([[1], [2]]);
    expect(finish).toHaveBeenCalledTimes(1);
    expect(demo.progress).toEqual({ ratio: 1, remaining: 0 });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not advance or finish while hidden", () => {
    const beat = vi.fn();
    const finish = vi.fn();
    const demo = new DemoClock([400, 800], beat, finish);
    demo.resume();
    vi.advanceTimersByTime(200);
    demo.pause();
    vi.advanceTimersByTime(5000);
    expect(beat).not.toHaveBeenCalled();
    expect(finish).not.toHaveBeenCalled();
    expect(demo.progress.ratio).toBe(0.25);
    demo.resume();
    vi.advanceTimersByTime(200);
    expect(beat).toHaveBeenCalledWith(1);
  });

  it("accelerates without resetting or slowing down a first pass", () => {
    const beat = vi.fn();
    const finish = vi.fn();
    const demo = new DemoClock([700, 1500, 3000, 6000], beat, finish);
    demo.resume();
    vi.advanceTimersByTime(500);
    demo.rush(780);
    const before = demo.progress.ratio;
    expect(demo.progress.remaining).toBeCloseTo(780);
    vi.advanceTimersByTime(220);
    expect(demo.progress.ratio).toBeGreaterThan(before);
    demo.rush(780);
    expect(demo.progress.remaining).toBeCloseTo(560);
    vi.advanceTimersByTime(565);
    expect(beat).toHaveBeenLastCalledWith(3);
    expect(finish).toHaveBeenCalledTimes(1);
  });
});
