import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

// usage: node compare.mjs <baseDir> <newDir> <outDir> [maxDefaultDiff]
const [baseDir, newDir, outDir, maxDefault = "0.002"] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const names = readdirSync(baseDir)
  .filter((f) => f.endsWith(".png"))
  .sort();
let fail = 0;
const rows = [];
for (const n of names) {
  const a = PNG.sync.read(readFileSync(path.join(baseDir, n)));
  const bp = path.join(newDir, n);
  let b;
  try {
    b = PNG.sync.read(readFileSync(bp));
  } catch {
    rows.push([n, "MISSING", "FAIL"]);
    fail++;
    continue;
  }
  if (a.width !== b.width || a.height !== b.height) {
    rows.push([n, `size ${a.width}x${a.height} vs ${b.width}x${b.height}`, "FAIL"]);
    fail++;
    continue;
  }
  const diff = new PNG({ width: a.width, height: a.height });
  const bad = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1, includeAA: false });
  const ratio = bad / (a.width * a.height);
  const max = n.startsWith("bake-") ? 0.0005 : n.startsWith("step-listen") || n.startsWith("step-voices") ? 0.01 : Number(maxDefault);
  const ok = ratio <= max;
  if (!ok) {
    fail++;
    writeFileSync(path.join(outDir, n.replace(".png", ".diff.png")), PNG.sync.write(diff));
  }
  rows.push([n, (ratio * 100).toFixed(4) + "%", ok ? "pass" : `FAIL >${(max * 100).toFixed(2)}%`]);
}
const w = Math.max(...rows.map((r) => r[0].length));
for (const [n, d, s] of rows) console.log(`${n.padEnd(w)}  ${d.padStart(24)}  ${s}`);
writeFileSync(path.join(outDir, "report.txt"), rows.map((r) => r.join("\t")).join("\n"));
console.log(fail ? `\n${fail} view(s) failed` : "\nall views pass");
process.exit(fail ? 1 : 0);
