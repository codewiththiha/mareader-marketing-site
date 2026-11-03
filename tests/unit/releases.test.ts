/** Release-note markdown parsing and the download picker maths. */
import { describe, expect, it } from "vitest";
import { inline, mdBlocks } from "../../src/lib/utils/md";
import { parseArm, parseOs, picksFor } from "../../src/lib/site/downloads";

describe("mdBlocks", () => {
  const src = [
    "## What's new",
    "",
    "- **Read along.** Words light up as spoken.",
    "  Second line of the same note.",
    "",
    "Plain paragraph with `code` and [notes](https://x.dev/n).",
  ].join("\n");
  const blocks = mdBlocks(src);

  it("splits headings, lists and paragraphs", () => {
    expect(blocks.map((b) => b.k)).toEqual(["h3", "ul", "p"]);
    expect(blocks[1].items).toHaveLength(1);
  });

  it("folds indented lines into the previous bullet", () => {
    const item = blocks[1].items?.[0] ?? [];
    expect(item.at(-1)?.text).toContain("Second line");
  });

  it("tokenises inline bold, code and links", () => {
    const p = blocks[2].inlines;
    expect(p.some((i) => i.k === "c" && i.text === "code")).toBe(true);
    expect(p.some((i) => i.k === "a" && i.href === "https://x.dev/n")).toBe(true);
    expect(inline("**a** b")[0]).toEqual({ k: "b", text: "a" });
  });
});

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

describe("picksFor", () => {
  it("offers the detected platform first, with siblings after", () => {
    const mac = picksFor("mac");
    expect(mac[0].url).toMatch(/_aarch64\.dmg$/);
    expect(mac[1].url).toMatch(/_x64\.dmg$/);
    const win = picksFor("windows");
    expect(win[0].url).toMatch(/-setup\.exe$/);
    const linux = picksFor("linux");
    expect(linux[0].url).toMatch(/\.AppImage$/);
  });

  it("falls back to the three primaries when unknown", () => {
    expect(picksFor("unknown")).toHaveLength(3);
  });
});
