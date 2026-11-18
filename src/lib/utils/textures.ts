/** Generates seamless bitmap paper and grain tiles once so zooms never run SVG filters. */
let installed = false;

function hash2(x: number, y: number, seed: number): number {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const fade = (t: number) => t * t * (3 - 2 * t);

function tileNoise(u: number, v: number, period: number, seed: number): number {
  const gx = u * period;
  const gy = v * period;
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const fx = fade(gx - x0);
  const fy = fade(gy - y0);
  const xa = ((x0 % period) + period) % period;
  const xb = (xa + 1) % period;
  const ya = ((y0 % period) + period) % period;
  const yb = (ya + 1) % period;
  const top = hash2(xa, ya, seed) + (hash2(xb, ya, seed) - hash2(xa, ya, seed)) * fx;
  const bot = hash2(xa, yb, seed) + (hash2(xb, yb, seed) - hash2(xa, yb, seed)) * fx;
  return top + (bot - top) * fy;
}

function fbm(u: number, v: number, basePeriod: number, octaves: number, seed: number): number {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  let p = basePeriod;
  for (let o = 0; o < octaves; o++) {
    sum += amp * tileNoise(u, v, p, seed + o * 31);
    norm += amp;
    amp *= 0.5;
    p *= 2;
  }
  return sum / norm;
}

function makeTile(size: number, fill: (u: number, v: number, x: number, y: number) => [number, number, number, number]): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "none";
  const img = ctx.createImageData(size, size);
  const d = img.data;
  let idx = 0;
  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = fill(x / size, v, x, y);
      d[idx++] = r;
      d[idx++] = g;
      d[idx++] = b;
      d[idx++] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  return `url("${canvas.toDataURL("image/png")}")`;
}

function buildAll() {
  const root = document.documentElement.style;
  const fine = makeTile(128, (u, v, x, y) => {
    const n = fbm(u, v, 42, 2, 4) * 0.65 + hash2(x, y, 17) * 0.35;
    const a = Math.max(0, Math.min(255, Math.round((n - 0.36) * 112)));
    return [78, 52, 22, a];
  });
  const mottle = makeTile(128, (u, v) => {
    const n = fbm(u, v, 4, 4, 9);
    const a = Math.max(0, Math.min(255, Math.round((n - 0.37) * 86)));
    return [88, 60, 26, a];
  });
  const dark = makeTile(128, (u, v, x, y) => {
    const n = fbm(u, v, 42, 2, 11) * 0.6 + hash2(x, y, 29) * 0.4;
    const a = Math.max(0, Math.min(255, Math.round((n - 0.44) * 155)));
    return [252, 234, 206, a];
  });
  root.setProperty("--tex-fine", fine);
  root.setProperty("--tex-mottle", mottle);
  root.setProperty("--tex-fine-dk", dark);
}

export function mountTextures(immediate = false) {
  if (installed || typeof document === "undefined") return;
  installed = true;
  if (immediate) {
    buildAll();
    return;
  }
  window.setTimeout(buildAll, 40);
}
