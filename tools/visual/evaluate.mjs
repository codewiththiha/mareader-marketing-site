// Self-review pipeline: static checks, build, screenshots, pixel compare.
// Writes tools/visual/REPORT.md and exits non-zero when any check fails.
// Usage: node tools/evaluate.mjs
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(import.meta.url), "..", "..", "..");
const shots = join(root, "tools", "visual", "shots");
const report = join(root, "tools", "visual", "REPORT.md");

const MIME = {
	".html": "text/html",
	".png": "image/png",
	".svg": "image/svg+xml",
	".js": "text/javascript",
	".css": "text/css",
	".ico": "image/x-icon"
};

function run(name, cmd, args) {
	try {
		execFileSync(cmd, args, { cwd: root, stdio: "pipe" });
		return { name, pass: true, detail: "ok" };
	} catch (error) {
		const tail = String(error.stdout ?? "") + String(error.stderr ?? "");
		return { name, pass: false, detail: tail.trim().split("\n").slice(-4).join(" / ").slice(0, 400) };
	}
}

function listSourceFiles(dir, out = []) {
	for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
		if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;
		const rel = `${dir}/${entry.name}`;
		if (entry.isDirectory()) listSourceFiles(rel, out);
		else if (/\.(ts|js|mjs|svelte|css|html)$/.test(entry.name)) out.push(rel);
	}
	return out;
}

const checks = [];

checks.push(run("eslint", "npm", ["run", "lint", "--silent"]));
checks.push(run("svelte-check", "npm", ["run", "check", "--silent"]));
checks.push(run("prettier", "npm", ["run", "format:check", "--silent"]));
checks.push(run("npm audit", "npm", ["audit", "--audit-level=low"]));
checks.push(run("comment policy", "python3", ["tools/check_comments.py", "."]));
checks.push(run("commit messages", "python3", ["tools/check_commit_message.py", "--log"]));

const sources = listSourceFiles("src").map((f) => [f, readFileSync(join(root, f), "utf8")]);
const reactImports = sources.filter(([, code]) =>
	/from\s+["']react|from\s+["']react-dom|useState\(|useEffect\(|useMemo\(/.test(code)
);
checks.push({
	name: "no react idioms",
	pass: reactImports.length === 0,
	detail: reactImports.length ? reactImports.map(([f]) => f).join(", ") : "src is react-free"
});
const runes = sources.filter(([f]) => f.endsWith(".svelte.ts") || f.endsWith(".svelte"));
const runesUsed = runes.filter(([, code]) => /\$(state|derived|effect|props)\b/.test(code)).length;
checks.push({
	name: "idiomatic runes",
	pass: runesUsed >= 10,
	detail: `${runesUsed}/${runes.length} components use runes`
});

const built = run("build", "npm", ["run", "build", "--silent"]);
checks.push(built);
if (built.pass) {
	const single = existsSync(join(root, "dist", "index.html")) && !existsSync(join(root, "dist", "assets"));
	checks.push({
		name: "single-file dist",
		pass: single,
		detail: single ? "dist/index.html only" : "extra assets emitted"
	});
}

const server = createServer((req, res) => {
	const url = new URL(req.url ?? "/", "http://localhost");
	const file = join(root, "dist", url.pathname === "/" ? "index.html" : url.pathname.slice(1));
	if (!file.startsWith(join(root, "dist")) || !existsSync(file) || !statSync(file).isFile()) {
		res.writeHead(404).end();
		return;
	}
	res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
	res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(8090, "127.0.0.1", resolve));
checks.push(
	run("screenshots", "node", ["tools/visual/capture.mjs", "--url", "http://127.0.0.1:8090/", "--out", shots])
);
checks.push(
	run("pixel parity", "node", [
		"tools/visual/compare.mjs",
		"--shots",
		shots,
		"--baseline",
		"tools/visual/baseline",
		"--max",
		"0.005",
		"--threshold",
		"0.1"
	])
);
server.close();

const failed = checks.filter((c) => !c.pass);
const lines = checks.map((c) => `| ${c.name} | ${c.pass ? "PASS" : "FAIL"} | ${c.detail} |`);
writeFileSync(
	report,
	`# Self-review report\n\n| check | result | detail |\n| --- | --- | --- |\n${lines.join("\n")}\n\nverdict: ${failed.length ? "FAIL" : "PASS"}\n`
);
console.log(readFileSync(report, "utf8"));
process.exit(failed.length ? 1 : 0);
