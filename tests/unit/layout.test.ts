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
  it("gives rotated phones both a readable caption and a camera aperture", () => {
    const L = layoutOf(keys, 740, 360);
    expect(L.landscape).toBe(true);
    expect(L.fa.h).toBeGreaterThan(200);
    expect(L.text.y).toBeGreaterThanOrEqual(60);
    expect(L.text.y + L.text.h).toBeLessThan(310);
  });

  it("keeps the reader visible on a 320px phone", () => {
    const L = layoutOf(hero, 320, 568);
    expect(L.fa.y + L.fa.h).toBeLessThan(520);
    expect(L.fa.w).toBeGreaterThan(275);
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
    const { x, y, scale } = camOf(L);
    expect(scale).toBeLessThanOrEqual(L.maxS + 1e-9);
    expect(x + (L.focus.x + L.focus.w / 2) * scale).toBeCloseTo(L.fa.x + L.fa.w / 2);
    expect(y + (L.focus.y + L.focus.h / 2) * scale).toBeCloseTo(L.fa.y + L.fa.h / 2);
  });
});
