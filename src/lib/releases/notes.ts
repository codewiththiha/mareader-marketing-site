const SUMMARY_START = "<!-- release-summary:start -->";
const SUMMARY_END = "<!-- release-summary:end -->";

type SummarySection = "New" | "Fixes";

export function isLegacyRelease(tag: string): boolean {
  const version = tag.match(
    /^[vV]?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
  );
  return (
    !!version && Number(version[1]) === 0 && Number(version[2]) === 0 && Number(version[3]) <= 5
  );
}

function summarySection(body: string): string | null {
  const entries: Record<SummarySection, string[]> = { New: [], Fixes: [] };
  let insideSummary = false;
  let current: SummarySection | null = null;
  let fence: { mark: string; length: number } | null = null;

  for (const line of body.split(/\r?\n/)) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      const mark = fenceMatch[1][0];
      if (!fence) fence = { mark, length: fenceMatch[1].length };
      else if (mark === fence.mark && fenceMatch[1].length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;

    const h2 = line.match(/^ {0,3}##[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (h2) {
      if (insideSummary) break;
      if (h2[1].trim().toLowerCase() === "summary") insideSummary = true;
      continue;
    }
    if (!insideSummary) continue;

    const h3 = line.match(/^ {0,3}###[ \t]+(.+?)[ \t]*#*[ \t]*$/);
    if (h3) {
      const heading = h3[1].trim().toLowerCase();
      current = heading === "new" ? "New" : heading === "fixes" ? "Fixes" : null;
      continue;
    }
    if (/^ {0,3}#{1,6}[ \t]/.test(line)) {
      current = null;
      continue;
    }
    const bullet = line.match(/^ {0,3}[-*][ \t]+(.+?)\s*$/);
    if (current && bullet) entries[current].push(bullet[1]);
  }

  const sections = (["New", "Fixes"] as const)
    .filter((section) => entries[section].length)
    .map(
      (section) => `### ${section}\n\n${entries[section].map((item) => `- ${item}`).join("\n")}`
    );
  return sections.length ? `## Summary\n\n${sections.join("\n\n")}` : null;
}

export function releaseSummary(body: string): string | null {
  const start = body.indexOf(SUMMARY_START);
  const end = start < 0 ? -1 : body.indexOf(SUMMARY_END, start + SUMMARY_START.length);
  if (start >= 0 && end >= 0) {
    return summarySection(body.slice(start + SUMMARY_START.length, end));
  }
  return summarySection(body);
}
