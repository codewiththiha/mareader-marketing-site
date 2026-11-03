/** Tiny inline markup parser: _italic_, [[mark]] and [[!selected]] tokens. */
export type Token =
  { kind: "text"; text: string } | { kind: "em"; text: string } | { kind: "mark"; text: string; sel: boolean; index: number };

export function rich(s: string, counter: { n: number } = { n: 0 }): Token[] {
  const out: Token[] = [];
  const re = /_([^_]+)_|\[\[(!?)([^\]]+)\]\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ kind: "text", text: s.slice(last, m.index) });
    const em = m[1] as string | undefined;
    if (em !== undefined) {
      out.push({ kind: "em", text: em });
    } else {
      out.push({ kind: "mark", text: m[3], sel: m[2] === "!", index: counter.n++ });
    }
    last = re.lastIndex;
  }
  if (last < s.length) out.push({ kind: "text", text: s.slice(last) });
  return out;
}
