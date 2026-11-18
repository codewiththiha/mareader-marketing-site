/** Caption placement, scrim gradient and camera target maths. */
import { describe, expect, it } from "vitest";
import { STEPS } from "../../src/lib/film/steps";
import { camOf, layoutOf, veilFor } from "../../src/lib/film/layout";

const hero = STEPS[0];
const keys = STEPS[6];

describe("layoutOf", () => {
  it("puts the hero caption above a centred window", () => {
    const L = layoutOf(hero, 1440, 900);
    expect(L.landscape).toBe(true);
    expect(L.side).toBe("top");
    expect(L.text.w).toBe(1440 - 96);
    expect(L.text.x).toBe(48);
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

describe("veilFor", () => {
  it("keeps the page colour solid under a side caption", () => {
    const L = layoutOf(keys, 1440, 900);
    const v = veilFor("left", L, 1440, 900);
    expect(v.startsWith("linear-gradient(90deg, var(--bg) 0px")).toBe(true);
    expect(v).toContain(`var(--bg) ${L.text.x + L.text.w - 10}px`);
    expect(v).toContain(`color-mix(in srgb, var(--bg) 0%, transparent) ${L.fa.x + Math.min(190, L.fa.w * 0.26)}px`);
  });

  it("fills behind a bottom caption on phones", () => {
    const L = layoutOf(keys, 390, 844);
    const v = veilFor(L.side, L, 390, 844);
    expect(v).toContain("linear-gradient(0deg");
    expect(v).toContain(`var(--bg) ${844 - L.text.y - 10}px`);
  });

  it("fades away from the hero window", () => {
    const L = layoutOf(hero, 1440, 900);
    const v = veilFor("top", L, 1440, 900);
    expect(v).toContain(`var(--bg) ${L.text.y + L.text.h - 10}px`);
    expect(v.endsWith("px)")).toBe(true);
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
