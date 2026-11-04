/** The download matrix maths and the curated release highlights. */
import { describe, expect, it } from "vitest";
import { GROUPS, parseArm, parseOs, primaryFor } from "../../src/lib/site/downloads";
import { highlightsFor } from "../../src/lib/site/highlights";
import { RELEASES } from "../../src/lib/site/releases";
import type { Release } from "../../src/lib/site/releases-type";

describe("platform parsing", () => {
  it("reads userAgentData first", () => {
    expect(parseOs("Mozilla/5.0 (X11; Linux x86_64)", "macOS")).toBe("mac");
    expect(parseOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "")).toBe("mac");
    expect(parseOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Windows")).toBe("windows");
    expect(parseOs("Mozilla/5.0 (X11; Linux x86_64)", "Linux")).toBe("linux");
    expect(parseOs("Mozilla/5.0 (iPhone; CPU OS 17_0)", "")).toBe("unknown");
  });

  it("spots Apple silicon in the agent string", () => {
    expect(parseArm("Mozilla/5.0 (Macintosh; Apple silicon)")).toBe(true);
    expect(parseArm("Mozilla/5.0 (Macintosh; Intel Mac OS X)")).toBe(false);
  });
});

describe("download matrix", () => {
  it("gives every build a real url and a size", () => {
    for (const g of GROUPS) {
      for (const o of g.options) {
        expect(o.url).toMatch(/^https:\/\/github\.com\//);
        expect(o.size).toMatch(/MB$/);
      }
    }
  });

  it("picks the build that matches the visitor", () => {
    expect(primaryFor("mac", true).id).toBe("mac-arm");
    expect(primaryFor("mac", false).id).toBe("mac-x64");
    expect(primaryFor("windows", false).id).toBe("win-exe");
    expect(primaryFor("linux", true).id).toBe("linux-app");
    expect(primaryFor("unknown", true).id).toBe("mac-arm");
  });
});

describe("highlights", () => {
  const items = (tag: string) => highlightsFor(RELEASES.find((r) => r.tag === tag) ?? RELEASES[0]).flatMap((s) => s.items);

  it("curates every shipped release in named sections", () => {
    for (const r of RELEASES) {
      const secs = highlightsFor(r);
      expect(secs.length).toBeGreaterThanOrEqual(1);
      expect(secs[0].title).not.toBe("");
      expect(secs.flatMap((s) => s.items).every((x) => x.rest)).toBe(true);
    }
  });

  it("varies the shape between releases", () => {
    const counts = RELEASES.map((r) => highlightsFor(r).flatMap((s) => s.items).length);
    expect(new Set(counts).size).toBeGreaterThan(2);
    expect(items("v0.0.5").length).not.toBe(items("v0.0.4").length);
  });

  it("falls back to the intro for an uncurated tag", () => {
    const fake: Release = {
      tag: "v9.9.9",
      name: "x",
      published: "2026-01-01",
      body: "Intro line.\n\n- technical detail",
      assets: [],
    };
    expect(highlightsFor(fake)[0].items[0]).toEqual({ lead: "", rest: "Intro line." });
  });
});
