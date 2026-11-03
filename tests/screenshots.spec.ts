// screenshots — capture routes and themes for CI review
import { test, type Page } from "@playwright/test";
import fs from "fs";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
});

async function dark(page: Page, on: boolean) {
  await page.emulateMedia({ colorScheme: on ? "dark" : "light" });
  await page.evaluate((d: boolean) => document.documentElement.classList.toggle("dark", d), on);
  await page.waitForTimeout(450);
}

test("home beats", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const [name, on] of [
    ["light", false],
    ["dark", true]
  ] as const) {
    await dark(page, on);
    const beats = [0, 0.16, 0.33, 0.5, 0.66, 0.82, 1];
    for (let i = 0; i < beats.length; i++) {
      await page.evaluate((p: number) => {
        const h = document.body.scrollHeight - window.innerHeight;
        window.scrollTo(0, h * p);
      }, beats[i]);
      await page.waitForTimeout(850);
      await page.screenshot({ path: `screenshots/home-${name}-${i}.png` });
    }
  }
});

test("home mobile", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await dark(page, false);
  await page.screenshot({ path: "screenshots/mobile-light.png" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/mobile-light-mid.png" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: "screenshots/mobile-light-end.png" });
  await dark(page, true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "screenshots/mobile-dark.png" });
});

test("routes", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const route of ["releases", "support"] as const) {
    await page.goto(`/#/${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    await dark(page, false);
    await page.screenshot({ path: `screenshots/${route}-light.png`, fullPage: true });
    await dark(page, true);
    await page.screenshot({ path: `screenshots/${route}-dark.png`, fullPage: true });
  }
  await page.goto("/#/support", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.locator('[data-testid="sup-flip"]').click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "screenshots/support-local.png", fullPage: true });
  await page.locator('[data-testid="sup-flip"]').click();
  await page.waitForTimeout(600);
  await page.locator('[data-testid="wallet-evm"] .chip').nth(3).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: "screenshots/support-evm-switch.png", fullPage: false });
});
