import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

export async function serveDist(root) {
  const dir = path.resolve(root);
  const server = http.createServer(async (req, res) => {
    try {
      const route = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      const file = path.resolve(dir, route === "/" ? "index.html" : `.${route}`);
      if (!file.startsWith(dir + path.sep)) throw new Error("Outside build directory");
      const body = await readFile(file);
      res.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}
