// site — behaviour: routing, detection, downloads, support, theme
import { test, expect, type Browser } from "@playwright/test";

const MAC_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const WIN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

async function withUA(browser: Browser, userAgent: string, arm = false) {
  const ctx = await browser.newContext({ userAgent });
  const page = await ctx.newPage();
  if (arm) {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "userAgentData", {
        value: {
          getHighEntropyValues: async () => ({ platform: "macOS", architecture: "arm" }),
          toJSON: () => ({})
        },
        configurable: true
      });
    });
  }
  await page.goto("/", { waitUntil: "networkidle" });
  return { ctx, page };
}

test("detects macOS and offers the dmg", async ({ browser }) => {
  const { ctx, page } = await withUA(browser, MAC_UA, true);
  const hero = page.locator('[data-testid="hero-dl"]');
  await expect(hero).toHaveText(/Download for macOS/);
  await expect(hero).toHaveAttribute("href", /\.dmg$/);
  const main = page.locator('[data-testid="dl-main"]');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(main).toBeVisible();
  await expect(main).toHaveAttribute("href", /aarch64\.dmg$/);
  await ctx.close();
});

test("detects windows and offers the exe", async ({ browser }) => {
  const { ctx, page } = await withUA(browser, WIN_UA);
  await expect(page.locator('[data-testid="hero-dl"]')).toHaveText(/Download for Windows/);
  await expect(page.locator('[data-testid="hero-dl"]')).toHaveAttribute("href", /-setup\.exe$/);
  await ctx.close();
});

test("phones get the three-system grid", async ({ browser }) => {
  const { ctx, page } = await withUA(browser, IPHONE_UA);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator(".dl-grid")).toBeVisible();
  await expect(page.locator(".dl-card")).toHaveCount(3);
  await expect(page.locator('[data-testid="dl-main"]')).toHaveCount(0);
  await ctx.close();
});

test("mac arch toggle switches the asset", async ({ page }) => {
  await page.goto("/?os=mac&arch=x64", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const main = page.locator('[data-testid="dl-main"]');
  await expect(main).toHaveAttribute("href", /x64\.dmg$/);
  await page.getByRole("radio", { name: "Apple Silicon" }).click();
  await expect(main).toHaveAttribute("href", /aarch64\.dmg$/);
});

test("nav pill routes between pages", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(".hdr").getByRole("link", { name: "Releases" }).click();
  await expect(page).toHaveURL(/#\/releases/);
  await expect(page.locator('[data-testid="rel-latest"]')).toBeVisible();
  await page.locator(".hdr").getByRole("link", { name: "Support" }).click();
  await expect(page).toHaveURL(/#\/support/);
  await expect(page.locator('[data-testid="wallet-evm"]')).toBeVisible();
  await page.locator(".hdr-brand").click();
  await expect(page).toHaveURL(/#\/$/);
});

test("releases page lists every build and folds older ones", async ({ page }) => {
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="rel-latest"]')).toContainText("v0.0.5");
  await expect(page.locator('[data-testid="rel-latest"] .notes')).toContainText("Read along");
  const rows = page.locator(".rel-row");
  await expect(rows).toHaveCount(4);
  const first = rows.first();
  await expect(first.locator(".rel-fold-in")).not.toBeVisible();
  await first.locator(".rel-row-head").click();
  await expect(first.locator(".rel-fold-in")).toBeVisible();
  await expect(first.locator(".rel-file").first()).toHaveAttribute("href", /releases\/download/);
});

test("support page defaults to crypto with styled QRs", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#/support", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="wallet-evm"]')).toBeVisible();
  await expect(page.locator(".qr > svg")).toHaveCount(5);
  await expect(page.locator(".qr-center")).toHaveCount(5);

  await expect(page.locator(".qr-net")).toHaveText("Ethereum");
  await page.getByRole("option", { name: "Base" }).click();
  await expect(page.locator(".qr-net")).toHaveText("Base");
  await expect(page.locator(".explorer")).toHaveAttribute("href", /basescan\.org/);

  const copy = page.locator('[data-testid="wallet-evm"] .copy');
  await copy.click();
  await expect(copy.locator(".copy-label")).toHaveText("Copied");
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip).toBe("0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7");
});

test("the myanmar question flips the panel", async ({ page }) => {
  await page.goto("/#/support", { waitUntil: "networkidle" });
  const flip = page.locator('[data-testid="sup-flip"]');
  await expect(flip).toContainText("Are you from Myanmar?");
  await flip.click();
  await expect(page.locator('[data-testid="local-panel"]')).toBeVisible();
  await expect(page.locator(".local-card")).toHaveCount(5);
  await expect(page.locator('[data-testid="sup-flip"]')).toContainText("Prefer crypto?");
  await page.locator('[data-testid="sup-flip"]').click();
  await expect(page.locator('[data-testid="wallet-evm"]')).toBeVisible();
});

test("yangon visitors land on local methods first", async ({ browser }) => {
  const ctx = await browser.newContext({ timezoneId: "Asia/Yangon" });
  const page = await ctx.newPage();
  await page.goto("/#/support", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="local-panel"]')).toBeVisible();
  await expect(page.locator('[data-testid="sup-flip"]')).toContainText("Prefer crypto?");
  await ctx.close();
});

test("theme toggle switches and persists", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const root = page.locator("html");
  await expect(root).not.toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(root).toHaveClass(/dark/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(root).toHaveClass(/dark/);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(root).not.toHaveClass(/dark/);
});
