import { chromium } from "@playwright/test";
import { spawn, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const port = 5178;
const origin = `http://127.0.0.1:${port}`;
const out = resolve("public/demos");
const temp = await mkdtemp(join(tmpdir(), "mareader-demos-"));
const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "0.0.0.0", "--port", String(port), "--strictPort"],
  {
    stdio: "ignore"
  }
);

const wait = (ms) => new Promise((done) => setTimeout(done, ms));
const ffmpeg = (...args) => {
  const result = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    encoding: "utf8"
  });
  if (result.status !== 0) throw new Error(result.stderr || "ffmpeg failed");
};

async function ready() {
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${origin}/scripts/demos/capture.html`)).ok) return;
    } catch {
      await wait(100);
    }
    await wait(100);
  }
  throw new Error("The capture server did not start");
}

async function scene(page, id) {
  await page.evaluate(
    (value) => window.dispatchEvent(new CustomEvent("capture-scene", { detail: value })),
    id
  );
}

async function cursor(page, value) {
  await page.evaluate(
    (detail) => window.dispatchEvent(new CustomEvent("capture-cursor", { detail })),
    value
  );
}

async function point(page, selector) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`Cannot find ${selector}`);
  await cursor(page, { x: box.x + box.width / 2, y: box.y + box.height / 2, visible: true });
  await wait(560);
}

async function clickScene(page, selector, next) {
  await point(page, selector);
  await cursor(page, { pressed: true });
  await wait(110);
  await scene(page, next);
  await wait(170);
  await cursor(page, { pressed: false });
}

const clips = [
  {
    name: "appearance",
    view: "appearance",
    start: "appearance-sepia",
    poster: "appearance-sepia",
    run: async (page) => {
      await wait(750);
      await clickScene(page, ".mk-preset:nth-child(2)", "appearance-green");
      await wait(1150);
      await clickScene(page, ".mk-preset:nth-child(3)", "appearance-night");
      await wait(1150);
      await clickScene(page, ".mk-preset:nth-child(4)", "appearance-parchment");
      await wait(1150);
      await clickScene(page, ".mk-preset:nth-child(1)", "appearance-sepia");
      await wait(1000);
      await cursor(page, { visible: false });
      await wait(500);
    }
  },
  {
    name: "panes",
    view: "full",
    start: "panes-two",
    poster: "panes-own",
    run: async (page) => {
      await wait(1000);
      await scene(page, "panes-four");
      await wait(2100);
      await scene(page, "panes-own");
      await wait(2300);
      await scene(page, "panes-two");
      await wait(1400);
    }
  },
  {
    name: "dictionary",
    view: "dictionary",
    start: "dictionary-base",
    poster: "ai-card",
    run: async (page) => {
      await wait(700);
      await clickScene(page, ".mk-w", "ai-select");
      await wait(650);
      await clickScene(page, ".mk-bar-row .mk-ibtn:nth-child(2)", "ai-card");
      await cursor(page, { visible: false });
      await wait(3900);
      await scene(page, "dictionary-base");
      await wait(1100);
    }
  },
  {
    name: "models",
    view: "settings",
    start: "models",
    poster: "models",
    run: async (page) => {
      await wait(1000);
      await clickScene(page, "[data-focus=keys] .mk-row.head", "keys-1");
      await cursor(page, { visible: false });
      await wait(1850);
      await scene(page, "keys-2");
      await wait(2100);
      await scene(page, "models");
      await wait(1400);
    }
  },
  {
    name: "voice",
    view: "voice",
    start: "voices",
    poster: "player",
    run: async (page) => {
      await wait(2200);
      await scene(page, "player");
      await wait(4700);
      await scene(page, "voices");
      await wait(1200);
    }
  }
];

async function poster(page, name) {
  const raw = join(temp, `${name}.jpg`);
  await page.screenshot({ path: raw, type: "jpeg", quality: 90 });
  ffmpeg("-i", raw, "-vf", "scale=1024:640:flags=lanczos", "-q:v", "5", join(out, `${name}.jpg`));
}

async function capture(browser, clip) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    recordVideo: { dir: temp, size: { width: 1280, height: 800 } }
  });
  const page = await context.newPage();
  await page.goto(`${origin}/scripts/demos/capture.html?view=${clip.view}&scene=${clip.poster}`, {
    waitUntil: "networkidle"
  });
  await page.evaluate(() => document.fonts.ready);
  await wait(2300);
  await poster(page, clip.name);
  await scene(page, clip.start);
  await wait(1600);
  const start = Date.now();
  await clip.run(page);
  const duration = (Date.now() - start) / 1000;
  const recording = page.video();
  await page.close();
  await context.close();
  const video = await recording.path();
  ffmpeg(
    "-sseof",
    `-${duration.toFixed(2)}`,
    "-i",
    video,
    "-an",
    "-vf",
    "fps=20,scale=1024:640:flags=lanczos",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-profile:v",
    "baseline",
    "-level",
    "3.1",
    "-pix_fmt",
    "yuv420p",
    "-crf",
    "27",
    "-g",
    "40",
    "-avoid_negative_ts",
    "make_zero",
    "-movflags",
    "+faststart",
    join(out, `${clip.name}.mp4`)
  );
  process.stdout.write(`Recorded ${clip.name}\n`);
}

try {
  await mkdir(out, { recursive: true });
  await ready();
  const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    for (const [name, dark] of [
      ["hero-light", 0],
      ["hero-dark", 1]
    ]) {
      await page.goto(`${origin}/scripts/demos/capture.html?scene=hero&dark=${dark}`, {
        waitUntil: "networkidle"
      });
      await page.evaluate(() => document.fonts.ready);
      await wait(1400);
      await poster(page, name);
    }
    await page.close();
    for (const clip of clips) await capture(browser, clip);
  } finally {
    await browser.close();
  }
} finally {
  server.kill("SIGTERM");
  await rm(temp, { recursive: true, force: true });
}
