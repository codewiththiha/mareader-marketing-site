// Captures one app build to PNGs: <dir>/index.html, frozen clock, per-shot scroll and frame advance.
import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import process from "node:process";
import { chromium } from "@playwright/test";
import { FREEZE, INIT, SNAP } from "./determinism.mjs";
import { serve } from "./serve.mjs";
import { plan } from "./shots.mjs";

const args = process.argv.slice(2);

function flag(name, fallback) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1] ?? "") : fallback;
}

const dir = resolve(flag("dir", "dist"));
const out = resolve(flag("out", "shots"));
const only = flag("only", "");
const label = flag("label", "new");
const step = 64;

await mkdir(out, { recursive: true });
const { server, url } = await serve(dir);
const browser = await chromium.launch();
const context = await browser.newContext();
const shots = plan().filter((s) => !only || s.name.includes(only));
let done = 0;

const warm = await context.newPage();
await warm.goto(url, { waitUntil: "load" });
await warm.evaluate(() => document.fonts.ready);
await warm.waitForTimeout(1200);
await warm.close();

for (const shot of shots) {
  const page = await context.newPage();
  await page.setViewportSize(shot.viewport);
  await page.emulateMedia({ colorScheme: shot.theme, reducedMotion: "reduce" });
  await page.addInitScript(INIT, { theme: shot.theme });
  await page.goto(url, { waitUntil: "load" });
  await page.addStyleTag({ content: "html{overflow-anchor:none;scroll-behavior:auto}" });
  await page.waitForSelector(shot.scene.selector, { timeout: 15000 });
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const box = el.getBoundingClientRect();
    const y = Math.round(box.top + window.scrollY - (window.innerHeight - box.height) / 2);
    window.scrollTo(0, Math.max(0, y));
  }, shot.scene.selector);
  await page.waitForTimeout(400);
  const frames = Math.max(1, Math.round(shot.ms / step));
  for (let i = 0; i < frames; i++) await page.evaluate((ms) => window.__advance(ms), step);
  await page.evaluate(FREEZE);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.__settle());
  await page.evaluate(SNAP);
  await page.screenshot({ path: join(out, `${shot.name}.${label}.png`), fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const scrollY = await page.evaluate(() => window.scrollY);
  console.log(`  scrollY=${scrollY}`);
  console.log(`${shot.name}.${label} overflow=${overflow}px`);
  done += 1;
  await page.close();
}

await context.close();
await browser.close();
server.close();
console.log(`captured ${done} shots from ${dir} -> ${out}`);
