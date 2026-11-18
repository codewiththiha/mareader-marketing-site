// Re-bakes src/blur after changing the demo window: npm run bake
const { chromium } = require("playwright");
const fs = require("fs");
const http = require("http");
const path = require("path");
const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
(async () => {
  const [file, outDir] = process.argv.slice(2);
  const root = file.endsWith(".html") ? path.dirname(file) : file;
  const srv = http.createServer((req, res) => {
    const q = decodeURIComponent((req.url || "/").split("?")[0]);
    const p = path.join(root, q === "/" || q === "" ? "index.html" : q.slice(1));
    fs.readFile(p, (err, buf) => {
      if (err) return res.writeHead(404).end();
      res.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream" }).end(buf);
    });
  });
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const b = await chromium.launch({ args: ["--font-render-hinting=none"] });
  const p = await b.newPage({ viewport: { width: 1536, height: 960 }, deviceScaleFactor: 1 });
  p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await p.goto(base + "?bakelist");
  await p.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 20000 });
  const list = await p.evaluate(() => window.__BAKE__);
  fs.mkdirSync(outDir, { recursive: true });
  for (const it of list) {
    await p.goto(base + "?bake=" + it.key);
    await p.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 20000 });
    await (await p.$("#bake-root")).screenshot({ path: `${outDir}/${it.key}.png`, omitBackground: true });
  }
  fs.writeFileSync(outDir + "/keys.json", JSON.stringify(list.map((x) => x.key)));
  console.log("baked", list.length);
  await b.close();
  srv.close();
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
