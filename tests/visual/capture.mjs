import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { VIEWS } from "./manifest.mjs";
import { serveDist } from "../static-server.mjs";

// usage: node capture.mjs <distDirOrUrl> <outDir> [views|bake|all]
const [target, outDir, which = "all"] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const server = /^https?:/.test(target) ? undefined : await serveDist(target);
const url = server?.url ?? target;

const ARGS = ["--font-render-hinting=none", "--force-color-profile=srgb", "--disable-lcd-text"];
const browser = await chromium.launch({ args: ARGS });

async function newPage(viewport, dark, ls) {
  const ctx = await browser.newContext({ viewport: { width: viewport[0], height: viewport[1] }, deviceScaleFactor: 1 });
  if (dark) await ctx.addInitScript(() => localStorage.setItem("mr-site", "dark"));
  if (ls) await ctx.addInitScript((items) => Object.entries(items).forEach(([k, v]) => localStorage.setItem(k, v)), ls);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  return { ctx, page };
}

const scrollTo = (page, view) =>
  page.evaluate((v) => {
    if (v.mode === "top") window.scrollTo(0, 0);
    else if (v.mode === "bottom") window.scrollTo(0, document.body.scrollHeight);
    else if (v.mode === "anchor") document.querySelector(v.sel).scrollIntoView({ block: "start" });
    else if (v.mode === "step") {
      const film = document.querySelector("[data-film]");
      if (film.dataset.stops) {
        const stops = JSON.parse(film.dataset.stops);
        window.scrollTo(0, film.offsetTop + Math.round((stops[v.step] + stops[v.step + 1]) / 2));
        return;
      }
      const b = JSON.parse(film.dataset.bounds);
      const span = film.offsetHeight - window.innerHeight;
      window.scrollTo(0, film.offsetTop + (b[v.step] + (b[v.step + 1] - b[v.step]) * 0.5) * span);
    }
  }, view);

if (which !== "bake") {
  for (const v of VIEWS) {
    const { ctx, page } = await newPage(v.viewport, v.dark, v.ls);
    await page.goto(url + (v.hash ?? ""));
    await page.waitForFunction(() => document.fonts.status === "loaded");
    await scrollTo(page, v);
    await page.waitForTimeout(v.wait);
    await page.screenshot({ path: path.join(outDir, v.name + ".png") });
    console.log("shot", v.name);
    await ctx.close();
  }
}

if (which !== "views") {
  const { ctx, page } = await newPage([1536, 960], false);
  await page.goto(url + "?bakelist");
  await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 20000 });
  const list = await page.evaluate(() => window.__BAKE__);
  for (let i = 0; i < list.length; i++) {
    await page.goto(`${url}?bake=${list[i].key}`);
    await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 20000 });
    await page.waitForTimeout(150);
    const el = await page.$("#bake-root");
    await el.screenshot({ path: path.join(outDir, `bake-${String(i).padStart(2, "0")}.png`), omitBackground: true });
    console.log("shot", "bake-" + String(i).padStart(2, "0"), list[i].key);
  }
  await ctx.close();
}

await browser.close();
server?.close();
