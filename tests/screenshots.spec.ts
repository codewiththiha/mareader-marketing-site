// screenshots — capture routes and the independent home previews
import { test, type Page } from "@playwright/test";
import fs from "fs";

test.setTimeout(90_000);
test.describe.configure({ retries: 2 });

test.beforeEach(async ({ page }) => {
  await page.route(
    "https://api.github.com/repos/codewiththiha/mareader/releases?per_page=30",
    (route) => route.abort()
  );
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
  await page.waitForTimeout(600);
}

async function show(page: Page, selector: string) {
  await page
    .locator(selector)
    .first()
    .evaluate((node) => {
      const top = node.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.max(0, top - 95));
    });
  await page.waitForTimeout(900);
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
    await page.goto("/#/releases", { waitUntil: "networkidle" });
    await dark(page, false);
    await page.screenshot({ path: "screenshots/mobile-light-releases-open.png" });
    await show(page, ".rel-mobile .rel-more");
    await page.screenshot({ path: "screenshots/mobile-light-releases-summary-end.png" });
    await page.locator(".rel-mobile-trigger").first().click();
    await page.screenshot({ path: "screenshots/mobile-light-releases-closed.png", fullPage: true });
    await dark(page, true);
    await page.screenshot({ path: "screenshots/mobile-dark-releases-closed.png", fullPage: true });
    await page.locator(".rel-mobile-trigger").first().click();
    await page.screenshot({ path: "screenshots/mobile-dark-releases-open.png" });
    await show(page, ".rel-mobile .rel-more");
    await page.screenshot({ path: "screenshots/mobile-dark-releases-summary-end.png" });
    await page.goto("/?support=local#/support", { waitUntil: "networkidle" });
    await dark(page, false);
    await page.screenshot({ path: "screenshots/mobile-light-support-local.png" });
    await dark(page, true);
    await page.screenshot({ path: "screenshots/mobile-dark-support-local.png" });
    await show(page, ".local-thanks");
    await page.screenshot({ path: "screenshots/mobile-dark-support-local-end.png" });
    await page.getByRole("radio", { name: "Crypto" }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: "screenshots/mobile-dark-support-crypto.png" });
    await dark(page, false);
    await page.screenshot({ path: "screenshots/mobile-light-support-crypto.png" });
    await show(page, ".sup-story");
    await page.screenshot({ path: "screenshots/mobile-light-support-note.png" });
    await dark(page, true);
    await page.screenshot({ path: "screenshots/mobile-dark-support-note.png" });
  });
});

test("first-launch guides", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await page.route("https://github.com/codewiththiha/mareader/releases/download/**", (route) =>
    route.fulfill({
      contentType: "application/octet-stream",
      headers: { "Content-Disposition": 'attachment; filename="mareader-test-installer"' },
      body: "download fixture"
    })
  );
  const open = async (kind: string) => {
    await Promise.all([
      page.waitForEvent("download"),
      page.locator(`[data-kind="${kind}"]`).click()
    ]);
    await page.getByRole("dialog").waitFor({ state: "visible" });
  };
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  await dark(page, false);
  await open("mac-arm");
  await page.screenshot({ path: "screenshots/guide-mac-light.png" });
  await page.keyboard.press("Escape");
  await dark(page, true);
  await open("win-exe");
  await page.screenshot({ path: "screenshots/guide-windows-dark.png" });
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?os=other#/downloads", { waitUntil: "networkidle" });
  await dark(page, false);
  await open("mac-intel");
  await page.screenshot({ path: "screenshots/guide-mobile-mac-light.png" });
  await page.locator(".guide-scroll").evaluate((node) => (node.scrollTop = node.scrollHeight));
  await page.screenshot({ path: "screenshots/guide-mobile-mac-light-end.png" });
  await page.keyboard.press("Escape");
  await dark(page, true);
  await open("win-arm-exe");
  await page.screenshot({ path: "screenshots/guide-mobile-windows-dark.png" });
  await page.keyboard.press("Escape");
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
