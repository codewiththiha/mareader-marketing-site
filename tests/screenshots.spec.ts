// screenshots — capture routes and the independent home previews
import { test, type Page } from "@playwright/test";
import fs from "fs";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready.then(() => 1));
});

async function dark(page: Page, on: boolean) {
  const current = await page.locator("html").evaluate((root) => root.classList.contains("dark"));
  if (current !== on) {
    await page
      .getByRole("button", { name: on ? "Switch to dark theme" : "Switch to light theme" })
      .click();
  }
  await page.waitForTimeout(250);
}

async function show(page: Page, selector: string) {
  await page
    .locator(selector)
    .first()
    .evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 95));
    });
  await page.waitForTimeout(450);
}

test("home sections", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const [name, on] of [
    ["light", false],
    ["dark", true]
  ] as const) {
    await dark(page, on);
    for (const [label, selector] of [
      ["hero", ".home-hero"],
      ["appearance", '[data-preview="appearance"]'],
      ["panes", '[data-preview="panes"]'],
      ["dictionary", '[data-preview="dictionary"]'],
      ["models", '[data-preview="models"]'],
      ["voice", '[data-preview="voice"]'],
      ["pitch", ".pitch-head"],
      ["download", ".cta-card"]
    ]) {
      await show(page, selector);
      await page.screenshot({ path: `screenshots/home-${name}-${label}.png` });
    }
    await page.locator('[data-preview="panes"]').evaluate((node) => {
      window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 8);
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `screenshots/home-${name}-floating-nav.png` });
  }
});

test.describe("mobile", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  });

  test("home mobile", async ({ page }) => {
    fs.mkdirSync("screenshots", { recursive: true });
    await dark(page, false);
    await show(page, ".home-hero");
    await page.screenshot({ path: "screenshots/mobile-light.png" });
    await show(page, '[data-preview="appearance"]');
    await page.screenshot({ path: "screenshots/mobile-light-preview.png" });
    await show(page, ".cta-card");
    await page.screenshot({ path: "screenshots/mobile-light-end.png" });
    await dark(page, true);
    await show(page, ".home-hero");
    await page.screenshot({ path: "screenshots/mobile-dark.png" });
    await show(page, '[data-preview="appearance"]');
    await page.screenshot({ path: "screenshots/mobile-dark-preview.png" });
    await show(page, ".cta-card");
    await page.screenshot({ path: "screenshots/mobile-dark-end.png" });
    await page.locator('[data-preview="appearance"]').evaluate((node) => {
      window.scrollTo(0, node.getBoundingClientRect().top + window.scrollY - 8);
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: "screenshots/mobile-dark-floating-nav.png" });
    await page.goto("/#/downloads", { waitUntil: "networkidle" });
    await dark(page, false);
    await page.screenshot({ path: "screenshots/mobile-light-downloads.png", fullPage: true });
    await dark(page, true);
    await page.screenshot({ path: "screenshots/mobile-dark-downloads.png", fullPage: true });
  });
});

test("routes", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const route of ["downloads", "releases", "support"] as const) {
    await page.goto(`/#/${route}`, { waitUntil: "networkidle" });
    await dark(page, false);
    await page.screenshot({ path: `screenshots/${route}-light.png`, fullPage: true });
    await dark(page, true);
    await page.screenshot({ path: `screenshots/${route}-dark.png`, fullPage: true });
  }
  await page.goto("/#/support", { waitUntil: "networkidle" });
  await page.locator('[data-testid="sup-flip"]').click();
  await page.waitForTimeout(350);
  await page.screenshot({ path: "screenshots/support-local.png", fullPage: true });
  await page.locator('[data-testid="sup-flip"]').click();
  await page.locator('[data-testid="wallet-evm"] .chip').nth(3).click();
  await page.waitForTimeout(250);
  await page.screenshot({ path: "screenshots/support-evm-switch.png", fullPage: false });
});
