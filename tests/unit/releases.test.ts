/** The download matrix maths and the release-summary reading. */
import { describe, expect, it } from "vitest";
import { archLabel, GROUPS, parseArm, parseOs, primaryFor } from "../../src/lib/site/downloads";
import { notesLead, releaseNotes } from "../../src/lib/site/release-notes";
import { RELEASES } from "../../src/lib/site/releases";

describe("platform parsing", () => {
  it("reads userAgentData first", () => {
    expect(parseOs("Mozilla/5.0 (X11; Linux x86_64)", "macOS")).toBe("mac");
    expect(parseOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "")).toBe("mac");
    expect(parseOs("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Windows")).toBe("windows");
    expect(parseOs("Mozilla/5.0 (X11; Linux x86_64)", "Linux")).toBe("linux");
    expect(parseOs("Mozilla/5.0 (iPhone; CPU OS 17_0)", "")).toBe("unknown");
    expect(parseOs("Mozilla/5.0 (Linux; Android 14; Pixel 8)", "Android")).toBe("unknown");
    expect(parseOs("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "", 5)).toBe("unknown");
  });

  it("spots ARM in the agent string", () => {
    expect(parseArm("Mozilla/5.0 (Macintosh; Apple silicon)")).toBe(true);
    expect(parseArm("Mozilla/5.0 (X11; Linux aarch64)")).toBe(true);
    expect(parseArm("Mozilla/5.0 (Windows NT 10.0; ARM64)")).toBe(true);
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

  it("offers both architectures on every system", () => {
    for (const g of GROUPS) {
      expect(g.options.some((o) => o.arch === "arm")).toBe(true);
      expect(g.options.some((o) => o.arch === "x64")).toBe(true);
    }
  });

  it("carries the ARM builds the project ships", () => {
    const arms = GROUPS.flatMap((g) => g.options.filter((o) => o.arch === "arm")).map((o) => o.id);
    expect(arms).toEqual(expect.arrayContaining(["mac-arm", "win-arm-exe", "linux-arm-app", "linux-arm-deb", "linux-arm-tar"]));
    for (const g of GROUPS) {
      for (const o of g.options.filter((x) => x.arch === "arm")) expect(o.url).toMatch(/(aarch64|arm64)/i);
    }
  });

  it("picks the build that matches the visitor", () => {
    expect(primaryFor("mac", true).id).toBe("mac-arm");
    expect(primaryFor("mac", false).id).toBe("mac-x64");
    expect(primaryFor("windows", true).id).toBe("win-arm-exe");
    expect(primaryFor("windows", false).id).toBe("win-exe");
    expect(primaryFor("linux", true).id).toBe("linux-arm-app");
    expect(primaryFor("linux", false).id).toBe("linux-app");
    expect(primaryFor("unknown", true).id).toBe("mac-arm");
  });

  it("names the architecture the way each system does", () => {
    expect(archLabel("mac", true)).toBe("Apple silicon");
    expect(archLabel("mac", false)).toBe("Intel");
    expect(archLabel("windows", true)).toBe("ARM64");
    expect(archLabel("linux", false)).toBe("x64");
  });
});

describe("release notes", () => {
  const body = [
    "# Mareader 1.2.3",
    "",
    "One line about the release.",
    "",
    "<!-- release-summary:start -->",
    "## Summary",
    "",
    "### New",
    "- **Faster panes.** Panes wake up sooner.",
    "- A flat bullet with no lead.",
    "",
    "### Fixes",
    "- **Windows icon.** It shows again.",
    "<!-- release-summary:end -->",
    "",
    "## What's new",
    "",
    "- **Full detail.** This belongs to the GitHub page.",
  ].join("\n");

  it("reads the marked summary and splits the bold lead", () => {
    const sections = releaseNotes(body);
    expect(sections.map((s) => s.title)).toEqual(["What’s new", "Fixes"]);
    expect(sections[0].items[0]).toEqual({ lead: "Faster panes", rest: "Panes wake up sooner." });
    expect(sections[0].items[1]).toEqual({ lead: "", rest: "A flat bullet with no lead." });
    expect(sections[1].items[0].lead).toBe("Windows icon");
  });

  it("keeps the longer notes for GitHub", () => {
    const texts = releaseNotes(body).flatMap((s) => s.items.map((i) => i.rest));
    expect(texts.some((t) => t.includes("GitHub page"))).toBe(false);
  });

  it("falls back to the opening sections of an older release", () => {
    const old = ["Intro line.", "", "## What's new", "", "- **Panes.** They pan.", "- **Icons.** They draw."].join("\n");
    const sections = releaseNotes(old);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("What’s new");
    expect(sections[0].items).toHaveLength(2);
  });

  it("stops a long section at six points", () => {
    const many = ["## What's new", "", ...Array.from({ length: 9 }, (_, i) => `- Point ${i}.`), ""].join("\n");
    expect(releaseNotes(many)[0].items).toHaveLength(6);
  });

  it("finds a summary in every snapshot release", () => {
    for (const release of RELEASES) {
      const sections = releaseNotes(release.body);
      expect(sections.length).toBeGreaterThan(0);
      expect(sections.flatMap((s) => s.items).every((i) => i.rest.length > 0)).toBe(true);
    }
  });
});

describe("release lead", () => {
  it("joins the whole opening paragraph", () => {
    const body = ["# Mareader 1.0.0", "", "One sentence that wraps", "over three lines and ends here.", "", "## Summary"].join("\n");
    expect(notesLead(body)).toBe("One sentence that wraps over three lines and ends here.");
  });

  it("skips headings and markers", () => {
    expect(notesLead(["<!-- release-summary:start -->", "## Summary", "", "### New", "- x."].join("\n"))).toBe("");
  });
});
