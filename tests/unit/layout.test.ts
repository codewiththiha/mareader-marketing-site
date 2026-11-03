/** Caption placement, lens mask and camera target maths. */
import { describe, expect, it } from "vitest";
import { STEPS } from "../../src/lib/film/steps";
import { camOf, layoutOf, maskFor } from "../../src/lib/film/layout";

const hero = STEPS[0];
const keys = STEPS[6];

describe("layoutOf", () => {
  it("puts the hero caption above a centred window", () => {
    const L = layoutOf(hero, 1440, 900);
    expect(L.landscape).toBe(true);
    expect(L.side).toBe("top");
    expect(L.text.w).toBe(1440);
    expect(L.fa.x + L.fa.w / 2).toBeCloseTo(720);
  });

  it("keeps step captions beside the window on wide screens", () => {
    const L = layoutOf(keys, 1440, 900);
    expect(L.landscape).toBe(true);
    expect(L.side).toBe("left");
    expect(L.text.x + L.text.w).toBeLessThan(L.fa.x + L.fa.w);
  });

  it("stacks captions on phones", () => {
    const L = layoutOf(keys, 390, 844);
    expect(L.landscape).toBe(false);
    expect(["top", "bottom"]).toContain(L.side);
  });
});

describe("maskFor", () => {
  it("fades the lens out before the caption edge", () => {
    const L = layoutOf(keys, 1440, 900);
    const m = maskFor("left", L, 1440, 900);
    const a = L.text.x + L.text.w * 0.92;
    expect(m).toBe(`linear-gradient(90deg, #000 0px, #000 ${a}px, transparent ${L.fa.x + 18}px)`);
  });
});

describe("camOf", () => {
  it("frames the focus inside the lens aperture", () => {
    const L = layoutOf(keys, 1440, 900);
    const [cx, cy, z, ax, ay] = camOf(L);
    const s = Math.exp(z);
    expect(s).toBeLessThanOrEqual(L.maxS + 1e-9);
    expect(cx).toBeCloseTo(L.focus.x + L.focus.w / 2);
    expect(ax).toBeCloseTo(L.fa.x + L.fa.w / 2);
    expect(ay).toBeCloseTo(L.fa.y + L.fa.h / 2);
    expect(cy * s).toBeLessThan(960 * s);
  });
});
