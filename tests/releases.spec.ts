import { test, expect } from "@playwright/test";

const API = "https://api.github.com/repos/codewiththiha/mareader2/releases?per_page=30";

test.beforeEach(async ({ page }) => {
  await page.route(API, (route) => route.abort());
});

test("desktop version outline selects one release and its own files", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=windows#/releases", { waitUntil: "networkidle" });
  const tabs = page.getByRole("tab");
  const panel = page.getByRole("tabpanel");
  await expect(page.getByRole("tablist", { name: "Versions" })).toHaveAttribute(
    "aria-orientation",
    "vertical"
  );
  await expect(tabs).toHaveCount(5);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(panel).toHaveAttribute("data-version", "v0.0.5");
  await expect(panel.locator(".notes")).toContainText("Read along");
  await expect(panel.locator(".rel-file")).toHaveCount(9);
  await expect(panel.getByTestId("rel-latest-download")).toHaveAttribute("href", /-setup\.exe$/);
  await expect(panel.getByRole("link", { name: /All downloads/ })).toHaveAttribute(
    "href",
    "#/downloads"
  );

  const older = page.getByRole("tab", { name: /v0\.0\.3/ });
  await older.click();
  await expect(older).toHaveAttribute("aria-selected", "true");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
  await expect(panel).toHaveAttribute("data-version", "v0.0.3");
  await expect(panel.locator(".notes")).toContainText("Page AI arrives");
  await expect(panel.locator(".notes")).not.toContainText("Read along becomes");
  await expect(panel.locator(".rel-file")).toHaveCount(9);
  for (const link of await panel.locator(".rel-file").all()) {
    await expect(link).toHaveAttribute("href", /\/v0\.0\.3\//);
  }
  await expect(panel.getByRole("link", { name: /PKGBUILD/ })).toHaveAttribute("href", /PKGBUILD$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
});

test("desktop versions support arrow keys, Home and End", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  const tabs = page.getByRole("tab");
  const panel = page.getByRole("tabpanel");
  await tabs.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(panel).toHaveAttribute("data-version", "v0.0.4");
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(panel).toHaveAttribute("data-version", "v0.0.1");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(panel).toHaveAttribute("data-version", "v0.0.5");
  await page.keyboard.press("ArrowUp");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("tabindex", "0");
  await expect(tabs.first()).toHaveAttribute("tabindex", "-1");
  await page.keyboard.press("Tab");
  await expect(panel).toBeFocused();
});

test("the sticky outline returns the selected notes to view", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 1000));
  const outline = page.locator(".rel-outline");
  await expect.poll(async () => (await outline.boundingBox())!.y).toBeGreaterThanOrEqual(75);
  expect((await outline.boundingBox())!.y).toBeLessThanOrEqual(90);
  await page.getByRole("tab", { name: /v0\.0\.4/ }).click();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-version", "v0.0.4");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(500);
});

test("on mobile the latest and earlier releases can all fold and unfold", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?os=other#/releases", { waitUntil: "networkidle" });
  const triggers = page.locator(".rel-mobile-trigger");
  const latest = page.locator("#release-mobile-panel-0");
  const older = page.locator("#release-mobile-panel-1");
  await expect(page.locator(".rel-desktop")).toBeHidden();
  await expect(triggers).toHaveCount(5);
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "true");
  await expect(latest.locator(".notes")).toContainText("Read along");
  await expect(older).toBeHidden();

  await triggers.first().focus();
  await page.keyboard.press("Enter");
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
  await expect(latest).toBeHidden();
  await expect(page.locator('.rel-mobile-trigger[aria-expanded="true"]')).toHaveCount(0);
  await triggers.nth(1).click();
  await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(older.locator(".notes")).toContainText("Read aloud arrives");
  await expect(older.locator(".rel-file")).toHaveCount(9);
  await triggers.nth(1).click();
  await expect(older).toBeHidden();
  await triggers.first().click();
  await expect(latest).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("the chosen version follows a resize between the two layouts", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  const triggers = page.locator(".rel-mobile-trigger");
  await triggers.first().click();
  await triggers.nth(1).click();
  await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-version", "v0.0.4");
  await expect(page.getByRole("tab", { name: /v0\.0\.4/ })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.getByRole("tab", { name: /v0\.0\.3/ }).click();
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(triggers.nth(2)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#release-mobile-panel-2 .notes")).toContainText("Page AI arrives");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("the latest Mac download keeps the shared chip choice", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=mac&arch=x64#/releases", { waitUntil: "networkidle" });
  const link = page.getByRole("tabpanel").getByTestId("rel-latest-download");
  await expect(link).toHaveAttribute("href", /x64\.dmg$/);
  await page.getByRole("radio", { name: "Apple Silicon" }).click();
  await expect(link).toHaveAttribute("href", /aarch64\.dmg$/);
  await expect(page.locator('[data-testid="hdr-dl"]')).toHaveAttribute("href", /aarch64\.dmg$/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("mareader-mac-arch")))
    .toBe("arm64");
});

test("live release data updates both the outline and the mobile accordion", async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          tag_name: "v9.9.9",
          published_at: "2026-11-10T12:00:00Z",
          body: "A newer release fixture.",
          assets: [
            {
              name: "new-build.tar.zst",
              size: 4096,
              browser_download_url: "https://example.test/v9.9.9/new-build.tar.zst"
            }
          ]
        },
        {
          tag_name: "v9.9.8",
          published_at: "2026-11-01T12:00:00Z",
          body: "An older release fixture.",
          assets: [
            {
              name: "PKGBUILD",
              size: 553,
              browser_download_url: "https://example.test/v9.9.8/PKGBUILD"
            }
          ]
        }
      ])
    })
  );
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=other#/releases", { waitUntil: "networkidle" });
  const panel = page.getByRole("tabpanel");
  await expect(page.getByRole("tab")).toHaveCount(2);
  await expect(panel).toHaveAttribute("data-version", "v9.9.9");
  await expect(panel.getByRole("link", { name: /new-build/ })).toHaveAttribute(
    "href",
    "https://example.test/v9.9.9/new-build.tar.zst"
  );
  await page.getByRole("tab", { name: /v9\.9\.8/ }).click();
  await expect(panel).toContainText("An older release fixture.");
  await expect(panel.getByRole("link", { name: /PKGBUILD/ })).toHaveAttribute(
    "href",
    "https://example.test/v9.9.8/PKGBUILD"
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const triggers = page.locator(".rel-mobile-trigger");
  await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
  await triggers.first().click();
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "true");
  await triggers.first().click();
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
});
