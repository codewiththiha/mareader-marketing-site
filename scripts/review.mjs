// Self-review: fail on visual regressions or bundle growth, summarise for CI.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const MAX_ENTRY = 95_000;
const report = await readFile(".visual-diff/report.txt", "utf8").catch(() => "");
const lines = report.split("\n").filter((l) => l.includes("\t"));
const fails = lines.filter((l) => l.includes("FAIL"));
const worst = lines.map((l) => l.split("\t")).sort((a, b) => Number.parseFloat(b[1]) - Number.parseFloat(a[1]))[0];
const html = await readFile("dist/index.html", "utf8");
const files = [...new Set([...html.matchAll(/(?:src|href)="(?:\.\/)?(assets\/[^"/]+\.(?:js|css))"/g)].map((m) => m[1]))];
const assets = await Promise.all(files.map((file) => readFile(path.join("dist", file))));
const size = assets.reduce((sum, file) => sum + gzipSync(file).length, gzipSync(html).length);
const summary = [
  `## Self review`,
  `- views compared: ${lines.length}`,
  `- failing views: ${fails.length}${fails.length ? ` (${fails.map((l) => l.split("\t")[0]).join(", ")})` : ""}`,
  `- worst diff: ${worst ? `${worst[0]} ${worst[1]}` : "n/a"}`,
  `- HTML + eager JS/CSS: ${(size / 1000).toFixed(0)} kB gzip (cap ${(MAX_ENTRY / 1000).toFixed(0)} kB)`,
].join("\n");
const sink = process.env.GITHUB_STEP_SUMMARY;
if (sink) await import("node:fs/promises").then((fs) => fs.appendFile(sink, summary + "\n"));
console.log(summary);
if (!files.length || fails.length || size > MAX_ENTRY) process.exit(1);
