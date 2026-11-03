// Captures deterministic screenshots of the built site.
// Freezes requestAnimationFrame so every scene rests at t = 0.
// Usage: node tools/visual/capture.mjs --url <url> --out <dir>
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : fallback;
};

const url = flag("url", "http://127.0.0.1:4173/");
const out = flag("out", "shots");

const SHOTS = [
	{ name: "desktop-light", width: 1280, height: 800, theme: "light", fullPage: true },
	{ name: "desktop-dark", width: 1280, height: 800, theme: "dark", fullPage: true },
	{ name: "desktop-hero", width: 1280, height: 800, theme: "light", fullPage: false },
	{ name: "mobile-light", width: 390, height: 844, theme: "light", fullPage: true }
];

mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
	args: ["--force-color-profile=srgb", "--font-render-hinting=none", "--disable-lcd-text"]
});

const results = [];

for (const shot of SHOTS) {
	const context = await browser.newContext({
		viewport: { width: shot.width, height: shot.height },
		deviceScaleFactor: 1,
		colorScheme: shot.theme
	});
	await context.addInitScript((theme) => {
		window.requestAnimationFrame = () => 0;
		window.cancelAnimationFrame = () => {};
		const si = window.setInterval.bind(window);
		window.setInterval = (fn, ms, ...rest) =>
			ms === 140
				? si(
						() => {
							if (window.__measureGo) fn();
						},
						ms,
						...rest
					)
				: si(fn, ms, ...rest);
		try {
			localStorage.setItem("mareader-site-theme", theme);
		} catch {}
	}, shot.theme);
	const warm = await context.newPage();
	await warm.goto(url, { waitUntil: "networkidle" });
	await warm.evaluate(() => document.fonts.ready);
	await warm.close();
	const page = await context.newPage();
	const errors = [];
	page.on("console", (m) => {
		if (m.type() === "error") errors.push(m.text());
	});
	page.on("pageerror", (e) => errors.push(String(e)));
	await page.goto(url, { waitUntil: "networkidle" });
	await page.addStyleTag({
		content: "*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }"
	});
	await page.evaluate(() => document.fonts.ready);
	const fontsOk = await page.evaluate(
		() => document.fonts.check("16px Inter") && document.fonts.check("16px Literata")
	);
	await page.evaluate(() => {
		window.__measureGo = true;
	});
	await page.waitForTimeout(900);
	const path = `${out}/${shot.name}.png`;
	await page.screenshot({ path, fullPage: shot.fullPage, animations: "disabled" });
	results.push({ name: shot.name, path, fontsOk, errors });
	await context.close();
}

await browser.close();

for (const r of results) {
	console.log(`${r.name}: fonts=${r.fontsOk ? "ok" : "MISSING"} errors=${r.errors.length}`);
	for (const e of r.errors) console.log(`  console error: ${e}`);
}

if (results.some((r) => !r.fontsOk)) {
	console.error("Fonts failed to load; screenshots are not comparable.");
	process.exit(1);
}
if (results.some((r) => r.errors.length > 0)) {
	console.error("Page reported console errors.");
	process.exit(1);
}
console.log(`Captured ${results.length} screenshots into ${out}`);
