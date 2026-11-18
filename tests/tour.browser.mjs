import assert from "node:assert/strict";
import { chromium, firefox, webkit } from "playwright";
import { serveDist } from "./static-server.mjs";

const { url, close } = await serveDist("dist");
const engines = process.argv.includes("--all") ? { chromium, firefox, webkit } : { chromium };
const stage = ".stage[data-scene]";
const next = ".tour-next";
const scene = (page, id) => page.waitForSelector(`${stage}[data-scene="${id}"]`, { timeout: 5000 });
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function open(browser, options) {
  const page = await browser.newPage(options);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await scene(page, "hero");
  return { page, errors };
}

async function toEdge(page) {
  await page.evaluate(() => window.scrollTo(0, JSON.parse(document.querySelector("[data-film]").dataset.stops)[2] - 18));
  await scene(page, "themes");
  await pause(270);
  await page.mouse.move(130, 230);
  await page.mouse.wheel(0, 46);
  await page.waitForSelector(`${next}.playing`, { timeout: 1100 });
  assert.equal(await page.locator(stage).getAttribute("data-scene"), "themes");
}

try {
  for (const [name, engine] of Object.entries(engines)) {
    const browser = await engine.launch();
    try {
      {
        const { page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } });
        await page.mouse.move(130, 230);
        await page.mouse.wheel(0, 55);
        await scene(page, "themes");
        assert.equal(await page.locator(`${next}.playing`).count(), 0);
        await page.waitForSelector(`${stage}[data-beat="1"] .pop.on`, { timeout: 2500 });
        assert.equal(await page.locator(`${stage} .cap.on`).count(), 1);
        assert.equal(await page.locator(`${stage} .pane`).count(), 1);
        assert.deepEqual(errors, []);
        await page.close();
      }
      {
        const { page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } });
        await toEdge(page);
        const head = page.locator(".tour-arrow-head");
        const headY = () => head.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
        const before = await headY();
        await pause(180);
        const after = await headY();
        assert(after < before, `Expected arrow to rise, got ${before} -> ${after}`);
        await page.waitForSelector(`${stage}[data-scene="panes"]`, { timeout: 1400 });
        await page.evaluate(() => window.scrollTo(0, JSON.parse(document.querySelector("[data-film]").dataset.stops)[2] - 18));
        await scene(page, "themes");
        await pause(270);
        await page.mouse.wheel(0, 46);
        await scene(page, "panes");
        assert.equal(await page.locator(`${next}.playing`).count(), 0);
        assert.deepEqual(errors, []);
        await page.close();
      }
      {
        const { page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } });
        await toEdge(page);
        await page.mouse.wheel(0, 280);
        await page.waitForSelector(`${stage}[data-scene="panes"]`, { timeout: 410 });
        assert.equal(await page.locator(`${next}.playing`).count(), 0);
        assert.deepEqual(errors, []);
        await page.close();
      }
      {
        const { page, errors } = await open(browser, { viewport: { width: 1440, height: 900 } });
        await page.mouse.move(130, 230);
        await page.mouse.wheel(0, 60);
        await scene(page, "themes");
        await pause(280);
        await page.mouse.wheel(0, 260);
        await page.waitForSelector(`${next}.playing`, { timeout: 700 });
        await page.waitForSelector(`${stage}[data-scene="themes"][data-beat="5"]`, { timeout: 1050 });
        assert.deepEqual(errors, []);
        await page.close();
      }
      {
        const { page, errors } = await open(browser, {
          viewport: { width: 320, height: 568 },
          hasTouch: true,
          isMobile: name !== "firefox",
          reducedMotion: "reduce",
          colorScheme: "dark",
        });
        assert.equal(await page.locator(".nav-dl").evaluate((el) => el.getBoundingClientRect().right <= innerWidth), true);
        const cue = page.locator(next);
        await cue.focus();
        await page.keyboard.press("Enter");
        await scene(page, "themes");
        assert.equal(await page.locator(".pop.on").count(), 1);
        assert.equal(await page.locator(`${next}.playing`).count(), 0);
        await page.locator(".tour-skip").click();
        await page.waitForFunction(
          () => document.activeElement?.id === "tour-end" && window.scrollY > document.querySelector(".film").offsetHeight - 10,
        );
        await page.locator(".nav-dl").click();
        await page.locator(".dl-page h1").waitFor();
        assert.deepEqual(errors, []);
        await page.close();
      }
      if (name === "chromium") {
        const { page, errors } = await open(browser, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
        assert.match(await page.locator(next).innerText(), /Swipe up to explore/);
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 210, y: 650 }] });
        for (let y = 638; y >= 542; y -= 12) {
          await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 210, y }] });
          await pause(17);
        }
        await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await scene(page, "themes");
        assert.equal(await page.locator(".stage.lite .lens.flat").count(), 1);
        assert.deepEqual(errors, []);
        await page.close();
      }
      console.log(`${name}: tour input, playback, bypass, and accessibility passed`);
    } finally {
      await browser.close();
    }
  }
} finally {
  close();
}
