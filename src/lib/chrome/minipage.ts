/** Sidebar thumbnail pages: deterministic pseudo-random line bars per kind. */
export type Mini = "title" | "toc" | "text" | "chapter";

export interface Bar {
  x: number;
  y: number;
  w: number;
  o: number;
  h: number;
  c: string;
}

export function rnd(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildBars(kind: Mini, seed: number): Bar[] {
  const bars: Bar[] = [];
  const line = (x: number, y: number, w: number, o = 0.38, h = 1.5, c = "var(--k)") => bars.push({ x, y, w, o, h, c });
  const para = (y0: number, y1: number, s: number) => {
    let y = y0;
    let n = 0;
    while (y < y1) {
      const end = rnd(s + n) > 0.8;
      line(n === 0 ? 20 : 17, y, end ? 40 + rnd(s + n * 3) * 70 : n === 0 ? 117 : 120);
      y += end ? 6.4 : 3.9;
      n++;
    }
  };
  if (kind === "title") {
    for (let i = 0; i < 11; i++) if (![1, 6, 8, 10].includes(i)) line(19, 16 + i * 3.6, 40 + rnd(i) * 60, 0.3, 1.2, "var(--a)");
    line(52, 118, 50, 0.85, 3);
    line(62, 132, 30, 0.8, 2.2);
    line(60, 146, 34, 0.4, 0.8);
    line(66, 158, 22, 0.7, 1.8);
  } else if (kind === "toc") {
    for (let c = 0; c < 3; c++)
      for (let r = 0; r < 21; r++)
        if (!(c === 2 && r === 20)) line(52 + c * 18, 12 + r * 2.9 + (c === 2 ? 2.9 : 0), 13, 0.55, 1.1, "var(--lk)");
    line(60, 92, 34, 0.4, 0.7);
    line(64, 104, 26, 0.85, 2.4);
    para(112, 146, seed);
  } else if (kind === "chapter") {
    para(12, 86, seed);
    line(64, 102, 26, 0.85, 2.4);
    para(114, 188, seed + 40);
  } else {
    para(12, 188, seed);
  }
  return bars;
}
