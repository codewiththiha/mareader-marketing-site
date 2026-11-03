// Pixel-diffs fresh screenshots against the committed baselines.
// Usage: node tools/visual/compare.mjs --shots <dir> [--baseline <dir>] [--max <ratio>]
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : fallback;
};

const shotsDir = flag("shots", "tools/visual/shots");
const baselineDir = flag("baseline", "tools/visual/baseline");
const maxRatio = Number(flag("max", "0.005"));
const threshold = Number(flag("threshold", "0.1"));

const names = readdirSync(baselineDir).filter((f) => f.endsWith(".png"));
const results = [];
let failed = false;

for (const name of names) {
	const baselinePath = path.join(baselineDir, name);
	const shotPath = path.join(shotsDir, name);
	if (!existsSync(shotPath)) {
		results.push({ name, ok: false, reason: "missing shot" });
		failed = true;
		continue;
	}
	const a = PNG.sync.read(readFileSync(baselinePath));
	const b = PNG.sync.read(readFileSync(shotPath));
	if (a.width !== b.width || a.height !== b.height) {
		results.push({ name, ok: false, reason: `size ${b.width}x${b.height} != ${a.width}x${a.height}` });
		failed = true;
		continue;
	}
	const diff = new PNG({ width: a.width, height: a.height });
	const bad = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold });
	const ratio = bad / (a.width * a.height);
	const ok = ratio <= maxRatio;
	mkdirSync(shotsDir, { recursive: true });
	writeFileSync(path.join(shotsDir, `diff-${name}`), PNG.sync.write(diff));
	if (!ok) failed = true;
	results.push({ name, ok, bad, ratio: Number(ratio.toFixed(6)) });
}

for (const r of results) {
	console.log(
		r.ok
			? `PASS ${r.name} diff=${r.bad}px (${(r.ratio * 100).toFixed(4)}%)`
			: `FAIL ${r.name} ${r.reason ?? `diff=${r.bad}px (${(r.ratio * 100).toFixed(4)}%)`}`
	);
}

writeFileSync(path.join(shotsDir, "compare.json"), JSON.stringify({ maxRatio, threshold, results }, null, 2));
process.exit(failed ? 1 : 0);
