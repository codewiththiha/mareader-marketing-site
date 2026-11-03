/** Safe markdown subset for release notes, parsed into renderable blocks. */
export interface Inline {
  k: "t" | "b" | "c" | "a";
  text: string;
  href?: string;
}

export interface Block {
  k: "h3" | "h4" | "p" | "ul";
  inlines: Inline[];
  items?: Inline[][];
}

const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:[^)\s]+)\)/g;

export function inline(text: string): Inline[] {
  const out: Inline[] = [];
  let at = 0;
  for (const m of text.matchAll(INLINE)) {
    const i = m.index ?? 0;
    if (i > at) out.push({ k: "t", text: text.slice(at, i) });
    if (m[1]) out.push({ k: "b", text: m[1] });
    else if (m[2]) out.push({ k: "c", text: m[2] });
    else out.push({ k: "a", text: m[3], href: m[4] });
    at = i + m[0].length;
  }
  if (at < text.length) out.push({ k: "t", text: text.slice(at) });
  return out;
}

export function mdBlocks(src: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ k: "p", inlines: inline(para.join(" ")) });
    para = [];
  };
  for (const raw of src.split("\n")) {
    const t = raw.trim();
    if (!t) {
      flush();
      continue;
    }
    const h = t.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      flush();
      out.push({ k: h[1].length === 2 ? "h3" : "h4", inlines: inline(h[2]) });
      continue;
    }
    const b = t.match(/^[-*]\s+(.*)$/);
    if (b) {
      flush();
      const last = out[out.length - 1];
      if (last?.k === "ul") last.items?.push(inline(b[1]));
      else out.push({ k: "ul", inlines: [], items: [inline(b[1])] });
      continue;
    }
    if (out[out.length - 1]?.k === "ul" && /^\s{2,}/.test(raw)) {
      const items = out[out.length - 1].items;
      const tail = items?.[items.length - 1];
      if (tail) tail.push({ k: "t", text: " " + t });
      continue;
    }
    para.push(t);
  }
  flush();
  return out;
}
