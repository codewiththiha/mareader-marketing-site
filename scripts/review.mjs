// Self-review: fail on visual regressions or bundle growth, summarise for CI.
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const MAX_BUNDLE = 1_200_000;

async function dirSize(root) {
  let total = 0;
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = path.join(root, e.name);
    total += e.isDirectory() ? await dirSize(full) : (await stat(full)).size;
  }
  return total;
}

const report = await readFile(".visual-diff/report.txt", "utf8").catch(() => "");
const lines = report.split("\n").filter((l) => l.includes("\t"));
const fails = lines.filter((l) => l.includes("FAIL"));
const worst = lines.map((l) => l.split("\t")).sort((a, b) => Number.parseFloat(b[1]) - Number.parseFloat(a[1]))[0];
const size = await dirSize("dist");
const summary = [
  `## Self review`,
  `- views compared: ${lines.length}`,
  `- failing views: ${fails.length}${fails.length ? ` (${fails.map((l) => l.split("\t")[0]).join(", ")})` : ""}`,
  `- worst diff: ${worst ? `${worst[0]} ${worst[1]}` : "n/a"}`,
  `- bundle: ${(size / 1000).toFixed(0)} kB (cap ${(MAX_BUNDLE / 1000).toFixed(0)} kB)`,
].join("\n");
const sink = process.env.GITHUB_STEP_SUMMARY;
if (sink) await import("node:fs/promises").then((fs) => fs.appendFile(sink, summary + "\n"));
console.log(summary);
if (fails.length || size > MAX_BUNDLE) process.exit(1);
