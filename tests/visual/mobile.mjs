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
  for (const width of [320, 390, 560, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 844 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      window.initialPreviewSizes = {};
      let first;
      const sample = (time) => {
        for (const preview of document.querySelectorAll("[data-timeline]")) {
          const win = preview.querySelector(".mr-win");
          if (!win) continue;
          first ??= time;
          const outer = preview.getBoundingClientRect();
          const inner = win.getBoundingClientRect();
          const name = preview.dataset.timeline;
          (window.initialPreviewSizes[name] ??= []).push({ width: inner.width / outer.width, height: inner.height / outer.height });
        }
        if (first === undefined || time - first < 450) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => Object.keys(window.initialPreviewSizes).length === 6 && window.initialPreviewSizes.hero.length >= 2);
    const sizes = await page.evaluate(() => window.initialPreviewSizes);
    assert(
      sizes.hero.every((size) => Math.abs(size.width - 1) < 0.02 && Math.abs(size.height - 1) < 0.02),
      "the hero must appear at its final size on first paint",
    );
    for (const [name, samples] of Object.entries(sizes)) {
      const firstSize = samples[0];
      assert(
        samples.every((size) => Math.abs(size.width - firstSize.width) < 0.02 && Math.abs(size.height - firstSize.height) < 0.02),
        `${name} must not scale in on first paint`,
      );
    }
    if (width > 560) {
      assert(await page.getByRole("navigation", { name: "Sections", exact: true }).isVisible());
      assert.deepEqual(errors, []);
      console.log(`${width}px desktop navigation and initial preview passed`);
      await page.close();
      continue;
    }
    const menu = page.getByRole("button", { name: "Open menu" });
    await menu.click();
    assert.equal(await page.getByRole("button", { name: "Close menu" }).getAttribute("aria-expanded"), "true");
    await page.keyboard.press("Escape");
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    assert(await menu.evaluate((el) => document.activeElement === el));
    await menu.click();
    await page.getByRole("navigation", { name: "Mobile sections" }).getByRole("link", { name: "Releases" }).click();
    await page.waitForURL("**/#/releases");
    assert.equal(await menu.getAttribute("aria-expanded"), "false");
    await menu.click();
    await page.getByRole("navigation", { name: "Mobile sections" }).getByRole("link", { name: "Support" }).click();
    await page.waitForURL("**/#/donate");
    await page.getByRole("link", { name: "Download Mareader" }).click();
    await page.waitForURL("**/#/download");
    await page.getByRole("link", { name: "Mareader, back to top" }).click();
    await page.waitForURL("**/#/");
    await page.getByRole("button", { name: "See features" }).click();
    await page.waitForFunction(() => document.querySelector("#features").getBoundingClientRect().top < 150);
    assert.equal(await page.locator(".feature-row").count(), 5);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "no horizontal page overflow");
    assert.deepEqual(errors, []);
    console.log(`${width}px mobile navigation, layout and initial preview passed`);
    await page.close();
  }
  for (const userAgent of [
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
  ]) {
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, userAgent, isMobile: true, hasTouch: true });
    await phone.goto(`http://127.0.0.1:${server.address().port}/#/download`);
    assert.equal(await phone.locator("main h1").innerText(), "Mareader for your desktop.");
    assert.equal(await phone.locator(".dl-cta").count(), 0, "a phone should not be offered a one-click desktop download");
    assert.equal(await phone.locator(".mine-pill").count(), 0, "a desktop operating system should not be marked as the phone's");
    assert.equal(await phone.locator(".dl-card").count(), 3);
    await phone.close();
  }
  console.log("phone download guidance passed");
} finally {
  await browser.close();
  server.close();
}
