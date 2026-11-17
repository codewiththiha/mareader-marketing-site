import { test, expect } from "@playwright/test";
import { isLegacyRelease, releaseSummary } from "../src/lib/releases/notes";

test("the full-note cutoff compares version numbers rather than strings", () => {
  for (const tag of ["v0.0.1", "v0.0.5", "0.0.5", "V0.0.5-rc.1+build.7"]) {
    expect(isLegacyRelease(tag), tag).toBe(true);
  }
  for (const tag of ["v0.0.6", "v0.0.10", "v0.1.0", "v1.0.0", "v0.0.6-rc.1", "next", ""]) {
    expect(isLegacyRelease(tag), tag).toBe(false);
  }
});

test("marked summaries win over similarly named headings elsewhere", () => {
  const body = [
    "# A release",
    "## Summary",
    "### New",
    "- A misleading earlier section.",
    "<!-- release-summary:start -->",
    "## Summary",
    "### New",
    "- A reader-facing feature.",
    "### Fixes",
    "- A reader-facing fix.",
    "<!-- release-summary:end -->",
    "## Details",
    "### New",
    "- A long detail that should not appear."
  ].join("\n");
  expect(releaseSummary(body)).toBe(
    "### New\n\n- A reader-facing feature.\n\n### Fixes\n\n- A reader-facing fix."
  );
});

test("unmarked summaries stop at the next top-level section", () => {
  const body = [
    "# Mareader",
    "## Summary",
    "### Fixes",
    "* A fixes-only change.",
    "## Details",
    "### Fixes",
    "- A long fix detail."
  ].join("\r\n");
  expect(releaseSummary(body)).toBe("### Fixes\n\n- A fixes-only change.");
});

test("invalid, missing and empty summaries never fall back to full notes", () => {
  expect(releaseSummary("## What's new\n- Long notes.\n## Fixes\n- Long fix.")).toBeNull();
  expect(releaseSummary("## Summary\n### New\n\n## Details\n- Long notes.")).toBeNull();
  expect(
    releaseSummary(
      "<!-- release-summary:start -->\n## Summary\n### New\n<!-- release-summary:end -->\n## Summary\n### New\n- Not in the marked summary."
    )
  ).toBeNull();
  expect(
    releaseSummary(
      "<!-- release-summary:start -->\n## Summary\n### New\n- A usable summary.\n## Details\n- Not a summary."
    )
  ).toBe("### New\n\n- A usable summary.");
});

test("only allowed subsections and their direct bullets are used", () => {
  const body = [
    "<!-- release-summary:start -->",
    "## Summary",
    "### New",
    "- A visible feature.",
    "    - A nested detail.",
    "```markdown",
    "- A code example, not a bullet.",
    "```",
    "### Internal",
    "- An internal change.",
    "### Fixes",
    "- A visible fix.",
    "#### More detail",
    "- Not a summary bullet.",
    "<!-- release-summary:end -->"
  ].join("\n");
  expect(releaseSummary(body)).toBe(
    "### New\n\n- A visible feature.\n\n### Fixes\n\n- A visible fix."
  );
});
