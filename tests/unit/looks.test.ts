/** Look resolution and the CSS custom properties each look emits. */
import { describe, expect, it } from "vitest";
import { LOOKS, look, resolve, rgba, varsOf } from "../../src/lib/looks";

describe("resolve", () => {
  it("maps home to the site default", () => {
    expect(resolve("home", "light")).toBe("parchment");
    expect(resolve("home", "dark")).toBe("dusk");
    expect(resolve("night", "dark")).toBe("night");
  });

  it("resolves every look to opaque paper and ink", () => {
    for (const l of Object.values(LOOKS)) {
      expect(l.p).toMatch(/^#[0-9a-f]{6}$/);
      expect(l.k).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

describe("rgba", () => {
  it("expands hex with an alpha", () => {
    expect(rgba("#f6f1e8", 0.26)).toBe("rgba(246, 241, 232, 0.26)");
  });
});

describe("varsOf", () => {
  it("emits the paper and ink custom properties", () => {
    const v = varsOf(look("home", "light"));
    expect(v).toContain("--p:#e6d9c3");
    expect(v).toContain("--k:");
  });
});
