// Compares <name>.new.png with <name>.ref.png and writes <name>.diff.png plus a summary table.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const out = resolve(process.argv.includes("--out") ? process.argv[process.argv.indexOf("--out") + 1] : "shots");
const maxRatio = Number(process.env.MAX_DIFF ?? "0.0015");
const names = (await readdir(out)).filter((f) => f.endsWith(".new.png")).map((f) => f.slice(0, -".new.png".length));
if (names.length === 0) throw new Error(`No new screenshots found in ${out}`);
const rows = [];
let worst = 0;

for (const name of names.sort()) {
  const newPath = join(out, `${name}.new.png`);
  const refPath = join(out, `${name}.ref.png`);
  let row;
  try {
    const a = PNG.sync.read(await readFile(newPath));
    const b = PNG.sync.read(await readFile(refPath));
    if (a.width !== b.width || a.height !== b.height) {
      row = { name, pixels: a.width * a.height, ratio: 1, note: `size ${a.width}x${a.height} vs ${b.width}x${b.height}` };
    } else {
      const diff = new PNG({ width: a.width, height: a.height });
      const changed = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1, alpha: 0.4 });
      await writeFile(join(out, `${name}.diff.png`), PNG.sync.write(diff));
      row = { name, pixels: a.width * a.height, ratio: changed / (a.width * a.height), note: `${changed} px` };
    }
  } catch (error) {
    row = { name, pixels: 0, ratio: 1, note: String(error).slice(0, 60) };
  }
  worst = Math.max(worst, row.ratio);
  rows.push(row);
  console.log(`${row.name.padEnd(34)} ${(row.ratio * 100).toFixed(3)}%  ${row.note}`);
}

const table = [
  "| shot | mismatch | note |",
  "| --- | --- | --- |",
  ...rows.map((r) => `| ${r.name} | ${(r.ratio * 100).toFixed(3)}% | ${r.note} |`),
];
const summary = [
  `## Visual parity`,
  ``,
  `Worst mismatch: **${(worst * 100).toFixed(3)}%** (gate ${(maxRatio * 100).toFixed(3)}%).`,
  ``,
  ...table,
  ``,
].join("\n");
await writeFile(join(out, "summary.md"), summary);
const gh = process.env.GITHUB_STEP_SUMMARY;
if (gh) await writeFile(gh, summary);

if (worst > maxRatio) {
  console.error(`FAIL: worst mismatch ${(worst * 100).toFixed(3)}% exceeds ${(maxRatio * 100).toFixed(3)}%`);
  process.exit(1);
}
console.log(`ok: ${rows.length} shots within gate`);
