/** Key rotation demo states: turns, rests and the set-aside key. */
import { describe, expect, it } from "vitest";
import { keyStates } from "../../src/lib/chrome/keystates";

describe("keyStates", () => {
  it("starts on the first key with the third resting", () => {
    const { rows, using } = keyStates(0);
    expect(using).toBe(0);
    expect(rows[0].status).toBe("In use");
    expect(rows[2].status).toBe("Resting, 24 s");
    expect(rows[3].status).toBe("Set aside: invalid key");
    expect(rows[3].tone).toBe("bad");
  });

  it("alternates two keys while one rests", () => {
    expect(keyStates(7).using).toBe(1);
    expect(keyStates(7).rows[2].status).toBe("Resting, 3 s");
  });

  it("rotates three keys once the rest ends", () => {
    expect(keyStates(8).rows[2].status).toBe("Ready");
    expect(keyStates(10).using).toBe(2);
    expect(keyStates(10).rows[2].status).toBe("In use");
  });

  it("repeats every sixteen ticks", () => {
    for (let t = 0; t < 16; t++) expect(keyStates(t + 16)).toEqual(keyStates(t));
  });
});
