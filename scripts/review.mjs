// Self-review: fail on visual regressions or bundle growth, summarise for CI.
import { readFile, stat } from "node:fs/promises";

const MAX_BUNDLE = 2_600_000;
const report = await readFile(".visual-diff/report.txt", "utf8").catch(() => "");
const lines = report.split("\n").filter((l) => l.includes("\t"));
const fails = lines.filter((l) => l.includes("FAIL"));
const worst = lines.map((l) => l.split("\t")).sort((a, b) => Number.parseFloat(b[1]) - Number.parseFloat(a[1]))[0];
const size = (await stat("dist/index.html").catch(() => ({ size: 0 }))).size;
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
