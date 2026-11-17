import { test, expect } from "@playwright/test";

const API = "https://api.github.com/repos/codewiththiha/mareader/releases?per_page=30";
const GITHUB_RELEASES = "https://github.com/codewiththiha/mareader/releases/tag";

test.beforeEach(async ({ page }) => {
  await page.route(API, (route) => route.abort());
});

test("desktop versions show new summaries and preserve the full old notes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=windows#/releases", { waitUntil: "networkidle" });
  const tabs = page.getByRole("tab");
  const panel = page.getByRole("tabpanel");
  await expect(page.getByRole("tablist", { name: "Versions" })).toHaveAttribute(
    "aria-orientation",
    "vertical"
  );
  await expect(tabs).toHaveCount(7);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await expect(panel).toHaveAttribute("data-version", "v0.0.7");
  await expect(panel.locator(".notes")).toContainText("Unified word lookup and AI context cards");
  await expect(panel.locator(".notes")).toContainText("Eliminated animation hitches");
  await expect(panel.locator(".notes").getByRole("heading", { name: "Summary" })).toHaveCount(0);
  await expect(panel.locator(".notes").getByRole("heading", { name: "New" })).toBeVisible();
  await expect(panel.locator(".rel-summary ul").first()).toHaveCSS("list-style-type", "disc");
  await expect(panel.locator(".notes")).not.toContainText("Unified Lookup and AI word cards.");
  await expect(panel.locator(".notes")).not.toContainText("Mareader brings unified dictionary");
  await expect(page.locator("body")).not.toContainText("Unified Lookup and AI word cards.");
  await expect(
    panel.locator(".notes").getByRole("heading", { name: "Which file to download" })
  ).toHaveCount(0);
  await expect(panel.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v0.0.7`);
  await expect(panel.locator(".rel-file")).toHaveCount(13);
  await expect(panel.getByTestId("rel-latest-download")).toHaveAttribute("href", /x64-setup\.exe$/);
  await expect(panel.getByRole("link", { name: /All downloads/ })).toHaveAttribute(
    "href",
    "#/downloads"
  );

  const previous = page.getByRole("tab", { name: /v0\.0\.6/ });
  await previous.click();
  await expect(previous).toHaveAttribute("aria-selected", "true");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
  await expect(panel).toHaveAttribute("data-version", "v0.0.6");
  await expect(panel.locator(".notes")).toContainText("Built-in update checks with silent");
  await expect(panel.locator(".notes")).not.toContainText(
    "Mareader checks GitHub Releases against"
  );
  await expect(panel.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v0.0.6`);
  await expect(panel.locator(".rel-file")).toHaveCount(13);

  await page.getByRole("tab", { name: /v0\.0\.5/ }).click();
  await expect(panel).toHaveAttribute("data-version", "v0.0.5");
  await expect(panel.locator(".notes")).toContainText("Reading aloud becomes reading along");
  await expect(
    panel.locator(".notes").getByRole("heading", { name: "Which file to download" })
  ).toBeVisible();
  await expect(
    panel.locator(".notes").getByRole("heading", { name: "The first launch" })
  ).toBeVisible();
  await expect(
    panel.locator(".notes").getByRole("heading", { name: "Known limits" })
  ).toBeVisible();
  await expect(panel.locator(".rel-more")).toHaveCount(0);
  await expect(panel.locator(".rel-file")).toHaveCount(9);

  await page.getByRole("tab", { name: /v0\.0\.3/ }).click();
  await expect(panel).toHaveAttribute("data-version", "v0.0.3");
  await expect(panel.locator(".notes")).toContainText("Page AI arrives");
  await expect(panel.locator(".notes")).not.toContainText("Reading aloud becomes");
  await expect(panel.locator(".rel-file")).toHaveCount(9);
  for (const link of await panel.locator(".rel-file").all()) {
    await expect(link).toHaveAttribute("href", /\/v0\.0\.3\//);
  }
  await expect(panel.getByRole("link", { name: /PKGBUILD/ })).toHaveAttribute("href", /PKGBUILD$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
});

test("every pre-summary release retains its complete notes", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  const panel = page.getByRole("tabpanel");
  for (const [tag, excerpt] of [
    ["v0.0.5", "Reading aloud becomes reading along"],
    ["v0.0.4", "Read aloud arrives"],
    ["v0.0.3", "Page AI arrives"],
    ["v0.0.2", "Mareader has its own icon"],
    ["v0.0.1", "The first build of Mareader"]
  ]) {
    await page.getByRole("tab", { name: new RegExp(tag.replaceAll(".", "\\.")) }).click();
    await expect(panel).toHaveAttribute("data-version", tag);
    const notes = panel.locator(".notes");
    await expect(notes).toContainText(excerpt);
    await expect(notes.getByRole("heading", { name: "Which file to download" })).toBeVisible();
    await expect(notes.getByRole("heading", { name: "The first launch" })).toBeVisible();
    await expect(notes.getByRole("heading", { name: "Known limits" })).toBeVisible();
    await expect(panel.locator(".rel-more")).toHaveCount(0);
    await expect(panel.locator(".rel-file")).toHaveCount(9);
  }
});

test("the full-notes link goes to the selected GitHub release", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.route(`${GITHUB_RELEASES}/v0.0.7`, (route) =>
    route.fulfill({ contentType: "text/html", body: "<title>Release on GitHub</title>" })
  );
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Read the full v0.0.7 release notes on GitHub" }).click();
  await expect(page).toHaveURL(`${GITHUB_RELEASES}/v0.0.7`);
  await expect(page).toHaveTitle("Release on GitHub");
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
  await expect(panel).toHaveAttribute("data-version", "v0.0.6");
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(panel).toHaveAttribute("data-version", "v0.0.1");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toBeFocused();
  await expect(panel).toHaveAttribute("data-version", "v0.0.7");
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
  await page.getByRole("tab", { name: /v0\.0\.5/ }).click();
  await page.evaluate(() => window.scrollTo(0, 1000));
  const outline = page.locator(".rel-outline");
  await expect.poll(async () => (await outline.boundingBox())!.y).toBeGreaterThanOrEqual(75);
  expect((await outline.boundingBox())!.y).toBeLessThanOrEqual(90);
  await page.getByRole("tab", { name: /v0\.0\.4/ }).click();
  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-version", "v0.0.4");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(500);
});

test("on mobile every release can fold and new summaries stay short", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?os=other#/releases", { waitUntil: "networkidle" });
  const triggers = page.locator(".rel-mobile-trigger");
  const latest = page.locator("#release-mobile-panel-0");
  const previous = page.locator("#release-mobile-panel-1");
  const old = page.locator("#release-mobile-panel-2");
  await expect(page.locator(".rel-desktop")).toBeHidden();
  await expect(triggers).toHaveCount(7);
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "true");
  await expect(latest.locator(".notes")).toContainText("Unified word lookup and AI context cards");
  await expect(latest.locator(".notes")).not.toContainText("Unified Lookup and AI word cards.");
  await expect(latest.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v0.0.7`);
  await expect(previous).toBeHidden();

  await triggers.first().focus();
  await page.keyboard.press("Enter");
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
  await expect(latest).toBeHidden();
  await expect(page.locator('.rel-mobile-trigger[aria-expanded="true"]')).toHaveCount(0);
  await triggers.nth(1).click();
  await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
  await expect(previous.locator(".notes")).toContainText("Built-in update checks");
  await expect(previous.getByRole("heading", { name: "Summary" })).toHaveCount(0);
  await expect(previous.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v0.0.6`);
  await expect(previous.locator(".rel-file")).toHaveCount(13);
  await triggers.nth(2).click();
  await expect(previous).toBeHidden();
  await expect(old.locator(".notes")).toContainText("Reading aloud becomes reading along");
  await expect(old.locator(".notes").getByRole("heading", { name: "Known limits" })).toBeVisible();
  await expect(old.locator(".rel-more")).toHaveCount(0);
  await expect(old.locator(".rel-file")).toHaveCount(9);
  await triggers.nth(2).click();
  await expect(old).toBeHidden();
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
  await expect(page.getByRole("tabpanel")).toHaveAttribute("data-version", "v0.0.6");
  await expect(page.getByRole("tab", { name: /v0\.0\.6/ })).toHaveAttribute(
    "aria-selected",
    "true"
  );
  await page.getByRole("tab", { name: /v0\.0\.3/ }).click();
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(triggers.nth(4)).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#release-mobile-panel-4 .notes")).toContainText("Page AI arrives");
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

test("live releases use only their summaries in both layouts", async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          tag_name: "v9.9.10",
          published_at: "2026-11-10T12:00:00Z",
          body: "Intro outside the summary.\n\n<!-- release-summary:start -->\n## Summary\n\n### New\n- New summary fixture.\n\n### Fixes\n- A fixed issue.\n<!-- release-summary:end -->\n\n## Details\n- Secret long detail.",
          assets: [
            {
              name: "new-build.tar.zst",
              size: 4096,
              browser_download_url: "https://example.test/v9.9.10/new-build.tar.zst"
            }
          ]
        },
        {
          tag_name: "v9.9.8",
          published_at: "2026-11-01T12:00:00Z",
          body: "## Summary\n\n### Fixes\n- Fixes-only summary.\n\n## Details\n- Long older detail.",
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
  await expect(panel).toHaveAttribute("data-version", "v9.9.10");
  await expect(panel.locator(".notes")).toContainText("New summary fixture.");
  await expect(panel.locator(".notes")).toContainText("A fixed issue.");
  await expect(panel).not.toContainText("Secret long detail.");
  await expect(panel).not.toContainText("Intro outside the summary.");
  await expect(panel.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v9.9.10`);
  await expect(panel.getByRole("link", { name: /new-build/ })).toHaveAttribute(
    "href",
    "https://example.test/v9.9.10/new-build.tar.zst"
  );
  await page.getByRole("tab", { name: /v9\.9\.8/ }).click();
  await expect(panel).toContainText("Fixes-only summary.");
  await expect(panel).not.toContainText("Long older detail.");
  await expect(panel.locator(".notes").getByRole("heading", { name: "New" })).toHaveCount(0);
  await expect(panel.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v9.9.8`);
  await expect(panel.getByRole("link", { name: /PKGBUILD/ })).toHaveAttribute(
    "href",
    "https://example.test/v9.9.8/PKGBUILD"
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const triggers = page.locator(".rel-mobile-trigger");
  await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
  await triggers.first().click();
  await expect(page.locator("#release-mobile-panel-0 .notes")).toContainText(
    "New summary fixture."
  );
  await expect(page.locator("#release-mobile-panel-0")).not.toContainText("Secret long detail.");
  await triggers.first().click();
  await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
});

test("an edited live summary is used even when its tag has not changed", async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          tag_name: "v0.0.7",
          published_at: "2026-11-17T12:00:00Z",
          body: "<!-- release-summary:start -->\n## Summary\n### Fixes\n- A corrected live summary.\n<!-- release-summary:end -->\n## Details\n- Hidden detail.",
          assets: []
        }
      ])
    })
  );
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("A corrected live summary.");
  await expect(panel).not.toContainText("Unified word lookup");
  await expect(panel).not.toContainText("Hidden detail.");
  await expect(panel).toContainText("Live");
});

test("a missing new summary never exposes long notes inline", async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          tag_name: "v0.0.8",
          published_at: "2026-11-20T12:00:00Z",
          body: "Lead prose.\n\n## What's new\n- Detailed feature.\n\n## Fixes\n- Detailed fix.",
          assets: []
        }
      ])
    })
  );
  await page.goto("/#/releases", { waitUntil: "networkidle" });
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("A summary isn’t available here yet.");
  await expect(panel).not.toContainText("Lead prose");
  await expect(panel).not.toContainText("Detailed feature");
  await expect(panel.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v0.0.8`);
  await page.setViewportSize({ width: 320, height: 640 });
  const mobile = page.locator("#release-mobile-panel-0");
  await expect(mobile).toContainText("A summary isn’t available here yet.");
  await expect(mobile).not.toContainText("Detailed feature");
  await expect(mobile.locator(".rel-more")).toHaveAttribute("href", `${GITHUB_RELEASES}/v0.0.8`);
});
