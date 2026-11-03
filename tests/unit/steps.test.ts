/** Film script: state merges and stable bake keys. */
import { describe, expect, it } from "vitest";
import { STEPS, bakeKey, bakeList, stateOf } from "../../src/lib/film/steps";

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

describe("bakeKey", () => {
  it("is deterministic per step, frame and site", () => {
    expect(bakeKey(6, 0, "light")).toBe(bakeKey(6, 0, "light"));
    expect(bakeKey(6, 0, "light")).not.toBe(bakeKey(6, 0, "dark"));
  });

  it("matches the keys shipped in the blur set", () => {
    expect(bakeKey(6, 0, "light")).toBe("keys-1d4l9ku");
    expect(bakeKey(8, 0, "light")).toBe("listen-wqoyxg");
    expect(bakeKey(9, 0, "light")).toBe("voices-ivlsve");
  });

  it("lists one entry per distinct blur", () => {
    const list = bakeList();
    expect(list).toHaveLength(16);
    expect(new Set(list.map((e) => e.key)).size).toBe(16);
  });
});
