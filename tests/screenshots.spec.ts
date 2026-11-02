// screenshots — capture desktop/mobile light/dark
import { test } from "@playwright/test";
import fs from "fs";

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
});

async function capture(page: any, name: string, viewport: any, colorScheme: "light" | "dark") {
  await page.emulateMedia({ colorScheme });
  await page.setViewportSize(viewport);
  await page.evaluate((c: string) => document.documentElement.classList.toggle("dark", c === "dark"), colorScheme);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `screenshots/${name}-scroll.png`, fullPage: false });
}

test("screenshots", async ({ page }) => {
  fs.mkdirSync("screenshots", { recursive: true });
  await capture(page, "desktop-light", { width: 1280, height: 900 }, "light");
  await capture(page, "desktop-dark", { width: 1280, height: 900 }, "dark");
  await capture(page, "mobile-light", { width: 390, height: 844 }, "light");
  await capture(page, "mobile-dark", { width: 390, height: 844 }, "dark");

  // beat scrolls
  for (let i = 0; i < 5; i++) {
    await page.evaluate((p) => window.scrollTo(0, document.body.scrollHeight * (p / 5)), i);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screenshots/scroll-${i}.png` });
  }
});
