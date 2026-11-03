import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { VIEWS } from "./manifest.mjs";

// usage: node capture.mjs <distDirOrUrl> <outDir> [views|bake|all]
const [target, outDir, which = "all"] = process.argv.slice(2);
const mkdir = async (d) => (await import("node:fs/promises")).mkdir(d, { recursive: true });
await mkdir(outDir);

let url = target;
let server;
if (!/^https?:/.test(target)) {
  server = http.createServer(async (req, res) => {
    const q = decodeURIComponent(req.url.split("?")[0]);
    const p = path.join(target, q === "/" || q === "" ? "index.html" : q.slice(1));
    try {
      const b = await readFile(p);
      res.writeHead(200, { "content-type": p.endsWith(".html") ? "text/html" : "application/octet-stream" });
      res.end(b);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  url = `http://127.0.0.1:${server.address().port}/`;
}

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
