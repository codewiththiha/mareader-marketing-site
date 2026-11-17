/** Reads the summary block a release body carries; the rest of the notes stay on GitHub. */
export interface NoteItem {
  lead: string;
  rest: string;
}

export interface NoteSection {
  title: string;
  items: NoteItem[];
}

const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const H2 = /^ {0,3}##[ \t]+(.+?)[ \t]*#*$/;
const H3 = /^ {0,3}###[ \t]+(.+?)[ \t]*#*$/;
const BULLET = /^ {0,3}[-*][ \t]+(.+)$/;
const LEAD = /^\*\*(.+?)\*\*[\s.:—–-]*/;
const START = "<!-- release-summary:start -->";
const END = "<!-- release-summary:end -->";
const MAX_POINTS = 6;

const plain = (s: string) =>
  s
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const point = (raw: string): NoteItem => {
  const lead = LEAD.exec(raw);
  if (!lead) return { lead: "", rest: plain(raw) };
  return { lead: plain(lead[1]).replace(/[.:]$/, ""), rest: plain(raw.slice(lead[0].length)) };
};

interface Draft {
  title: string;
  points: string[];
}

function drafts(md: string): Draft[] {
  const out: Draft[] = [];
  let current: Draft | null = null;
  let fence: string | null = null;
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    const marker = FENCE.exec(line);
    if (marker) {
      fence = fence ? null : marker[1][0];
      continue;
    }
    if (fence) continue;
    const h2 = H2.exec(line);
    if (h2) {
      const title = h2[1].trim();
      current = /^summary$/i.test(title) ? null : { title, points: [] };
      if (current) out.push(current);
      continue;
    }
    const h3 = H3.exec(line);
    if (h3) {
      current = { title: h3[1].trim(), points: [] };
      out.push(current);
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet && current) current.points.push(bullet[1]);
  }
  return out.filter((d) => d.points.length > 0);
}

const titled = (d: Draft): NoteSection => ({
  title: /^(what.?s new|new)$/i.test(d.title) ? "What’s new" : d.title,
  items: d.points
    .slice(0, MAX_POINTS)
    .map(point)
    .filter((p) => p.rest),
});

const LEGACY_TITLES = /^(what.?s new|new|fixes|changes)$/i;

export function releaseNotes(body: string): NoteSection[] {
  const start = body.indexOf(START);
  const end = start < 0 ? -1 : body.indexOf(END, start + START.length);
  if (start >= 0 && end >= 0) {
    const marked = drafts(body.slice(start + START.length, end));
    if (marked.length) return marked.map(titled).filter((s) => s.items.length > 0);
  }
  return drafts(body)
    .filter((d) => LEGACY_TITLES.test(d.title))
    .slice(0, 2)
    .map(titled)
    .filter((s) => s.items.length > 0);
}

const PROSE = /^(#|<!--|[-*+>|]|\d+[.)]\s)/;

export function notesLead(body: string): string {
  const lines = body.split(/\r?\n/);
  const prose = (line: string) => line.length > 0 && !PROSE.test(line);
  const start = lines.findIndex((line) => prose(line.trim()));
  if (start < 0) return "";
  const paragraph: string[] = [];
  for (const line of lines.slice(start)) {
    const text = line.trim();
    if (!prose(text)) break;
    paragraph.push(text);
  }
  return plain(paragraph.join(" "));
}
