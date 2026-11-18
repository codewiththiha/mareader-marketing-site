import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import http from "node:http";
import { chromium } from "playwright";

const html = await readFile("dist/index.html");
const server = http.createServer((_req, res) => {
  res.writeHead(200, { "content-type": "text/html" });
  res.end(html);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch();

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);

  const fits = async (preview, selector) =>
    preview.evaluate((el, selector) => {
      const outer = el.getBoundingClientRect();
      const inner = el.querySelector(selector).getBoundingClientRect();
      const epsilon = 1;
      return (
        inner.left >= outer.left - epsilon &&
        inner.right <= outer.right + epsilon &&
        inner.top >= outer.top - epsilon &&
        inner.bottom <= outer.bottom + epsilon
      );
    }, selector);

  for (const name of ["hero", "appearance", "panes", "dictionary", "models", "voice"]) {
    const preview = page.locator(`[data-timeline="${name}"]`);
    await preview.scrollIntoViewIfNeeded();
    await page.waitForFunction((n) => document.querySelector(`[data-timeline="${n}"]`).dataset.playing === "true", name);
    const frame = await preview.getAttribute("data-frame");
    await page.waitForFunction(
      ({ n, frame }) => document.querySelector(`[data-timeline="${n}"]`).dataset.frame !== frame,
      { n: name, frame },
      { timeout: 6000 },
    );
    console.log(`${name} advances in view`);
    if (name === "appearance") {
      assert(await fits(preview, ".mr-win"), "the entire reader window should fit in the appearance preview");
      assert(await fits(preview, ".pop"), "the entire appearance popover should fit in the preview");
    }
    if (name === "models") {
      await page.waitForFunction(() => document.querySelector('[data-timeline="models"]').dataset.frame === "1");
      await page.waitForTimeout(1100);
      assert(await fits(preview, ".st"), "the complete model settings window should fit");
      assert(await fits(preview, ".st-keys"), "the API key rows should fit");
      const before = await preview.locator(".st-keys").innerText();
      await page.waitForTimeout(1200);
      assert.notEqual(await preview.locator(".st-keys").innerText(), before, "key rotation should animate");
    }
    if (name === "voice") {
      await page.waitForFunction(() => document.querySelector('[data-timeline="voice"]').dataset.frame === "2", null, { timeout: 6000 });
      await page.waitForTimeout(1000);
      const visible = await preview.evaluate((el) => {
        const outer = el.getBoundingClientRect();
        const player = el.querySelector(".pl");
        const inner = player.getBoundingClientRect();
        return (
          getComputedStyle(player).opacity === "1" &&
          inner.left >= outer.left &&
          inner.right <= outer.right &&
          inner.top >= outer.top &&
          inner.bottom <= outer.bottom
        );
      });
      assert(visible, "the read-aloud player should be visible in the preview");
      const before = await preview.locator(".pl-track i").getAttribute("style");
      await page.waitForTimeout(1700);
      assert.notEqual(await preview.locator(".pl-track i").getAttribute("style"), before, "player progress should animate");
    }
  }

  const voice = page.locator('[data-timeline="voice"]');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => document.querySelector('[data-timeline="voice"]').dataset.playing === "false");
  const paused = await voice.getAttribute("data-frame");
  await page.waitForTimeout(4500);
  assert.equal(await voice.getAttribute("data-frame"), paused, "offscreen previews should pause");

  const dictionary = page.locator('[data-timeline="dictionary"]');
  await dictionary.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-timeline="dictionary"]').dataset.frame === "2", null, { timeout: 10000 });
  await page.waitForFunction(() => document.querySelector('[data-timeline="dictionary"]').dataset.frame === "0", null, { timeout: 7000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => document.querySelector('[data-timeline="dictionary"]').dataset.playing === "false");
  assert.equal(await dictionary.getAttribute("data-frame"), "2");
  await page.waitForTimeout(2500);
  assert.equal(await dictionary.getAttribute("data-frame"), "2", "reduced motion should keep the poster still");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(() => document.querySelector('[data-timeline="dictionary"]').dataset.playing === "true");
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (error) => errors.push(error.message));
  await mobile.goto(`http://127.0.0.1:${server.address().port}/`);
  for (const [name, selector] of [
    ["appearance", ".pop"],
    ["models", ".st"],
  ]) {
    const preview = mobile.locator(`[data-timeline="${name}"]`);
    await preview.scrollIntoViewIfNeeded();
    await mobile.waitForTimeout(1000);
    assert(await fits(preview, selector), `${name} controls should fit on mobile`);
  }
  await mobile.close();
  assert.deepEqual(errors, []);
  console.log("looping, framing, offscreen pause and reduced motion passed");
} finally {
  await browser.close();
  server.close();
}
