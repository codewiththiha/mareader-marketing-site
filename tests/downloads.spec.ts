import { test, expect } from "@playwright/test";

const API = "https://api.github.com/repos/codewiththiha/mareader2/releases?per_page=30";
const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IPAD_DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

test.beforeEach(async ({ page }) => {
  await page.route(API, (route) => route.abort());
});

test("Other systems opens its own page and leaves every installer available", async ({ page }) => {
  await page.goto("/?os=windows", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="hero-dl"]')).toHaveAttribute("href", /-setup\.exe$/);
  await page.getByRole("link", { name: "Other systems" }).click();
  await expect(page).toHaveURL(/#\/downloads$/);
  await expect(page).toHaveTitle("Downloads — Mareader");
  await expect(page.getByRole("heading", { name: "Download Mareader." })).toBeVisible();
  await expect(page.locator(".hdr .pill-item[aria-current='page']")).toHaveCount(0);
  await expect(page.locator(".hdr .pill-mark")).toHaveCSS("opacity", "0");
  await expect(page.locator('.downloads-system[data-os="windows"]')).toHaveClass(/detected/);
  await expect(page.locator(".downloads-system.detected")).toHaveCount(1);
  await expect(page.locator(".downloads-badge")).toHaveText(/Your system/);

  const files: Record<string, RegExp> = {
    "mac-arm": /aarch64\.dmg$/,
    "mac-intel": /x64\.dmg$/,
    "win-exe": /-setup\.exe$/,
    "win-msi": /\.msi$/,
    "linux-deb": /amd64\.deb$/,
    "linux-appimage": /\.AppImage$/,
    "linux-arch": /x86_64\.tar\.gz$/,
    "linux-pkgbuild": /\/PKGBUILD$/
  };
  await expect(page.locator(".downloads-file")).toHaveCount(8);
  for (const [kind, pattern] of Object.entries(files)) {
    const file = page.locator(`[data-kind="${kind}"]`);
    await expect(file).toBeVisible();
    await expect(file).toHaveAttribute("href", pattern);
  }
  await expect(page.getByRole("link", { name: /SHA-256 checksums/ })).toHaveAttribute(
    "href",
    /\/SHA256SUMS$/
  );
  await expect(page.locator('[data-kind="linux-pkgbuild"]')).toContainText("553 B");
  await page.locator('.downloads-system[data-os="mac"] summary').click();
  await expect(page.locator('.downloads-system[data-os="mac"] details p')).toContainText(
    "Privacy & Security"
  );
  await page
    .getByRole("link", { name: /Release notes/ })
    .first()
    .click();
  await expect(page).toHaveURL(/#\/releases$/);
  await page.goBack();
  await expect(page).toHaveURL(/#\/downloads$/);
  await expect(page.locator('.downloads-system[data-os="windows"]')).toHaveClass(/detected/);
});

for (const [os, label] of [
  ["mac", "macOS"],
  ["windows", "Windows"],
  ["linux", "Linux"]
] as const) {
  test(`highlights only ${label} when that desktop OS is detected`, async ({ page }) => {
    await page.goto(`/?os=${os}#/downloads`, { waitUntil: "networkidle" });
    await expect(page.locator(".downloads-system")).toHaveCount(3);
    await expect(page.locator(".downloads-system.detected")).toHaveCount(1);
    await expect(page.locator(`.downloads-system[data-os="${os}"]`)).toHaveClass(/detected/);
    await expect(page.locator(".downloads-system").first()).toHaveAttribute("data-os", os);
    await expect(page.locator('[data-testid="download-detection"]')).toContainText(label);
    await expect(page.locator(".downloads-file")).toHaveCount(8);
  });
}

test("the detected system uses the inverted theme surface without a side outline", async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  const system = page.locator('.downloads-system[data-os="mac"]');
  const checkSurface = async () => {
    const style = await system.evaluate((element) => {
      const probe = document.createElement("span");
      probe.style.backgroundColor = "var(--btn)";
      probe.style.color = "var(--btn-fg)";
      document.body.append(probe);
      const expected = getComputedStyle(probe);
      const actual = getComputedStyle(element);
      const result = {
        surface: actual.backgroundColor,
        text: actual.color,
        expectedSurface: expected.backgroundColor,
        expectedText: expected.color,
        before: getComputedStyle(element, "::before").content
      };
      probe.remove();
      return result;
    });
    expect(style.surface).toBe(style.expectedSurface);
    expect(style.text).toBe(style.expectedText);
    expect(style.before).toMatch(/^(none|normal)$/);
  };
  await checkSurface();
  await expect(system).toHaveCSS("background-color", "rgb(29, 26, 21)");
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await checkSurface();
  await expect(system).toHaveCSS("background-color", "rgb(244, 240, 231)");
  await system.locator('[data-kind="mac-arm"]').focus();
  await expect(system.locator('[data-kind="mac-arm"]')).toBeFocused();
});

test("download choices use compact editorial rows that stack on phones", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  const systems = page.locator(".downloads-system");
  for (const system of await systems.all()) {
    if (!(await system.evaluate((element) => element.classList.contains("detected")))) {
      await expect(system).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(system).toHaveCSS("border-top-left-radius", "0px");
    }
    const heading = (await system.locator(".downloads-system-head").boundingBox())!;
    const files = (await system.locator(".downloads-system-content").boundingBox())!;
    expect(heading.x + heading.width).toBeLessThan(files.x);
  }
  const linuxFiles = page.locator('.downloads-system[data-os="linux"] .downloads-file');
  const first = (await linuxFiles.nth(0).boundingBox())!;
  const second = (await linuxFiles.nth(1).boundingBox())!;
  expect(first.y).toBe(second.y);
  expect(first.x + first.width).toBeLessThan(second.x);

  await page.setViewportSize({ width: 320, height: 640 });
  for (const system of await systems.all()) {
    const heading = (await system.locator(".downloads-system-head").boundingBox())!;
    const files = (await system.locator(".downloads-system-content").boundingBox())!;
    expect(heading.y + heading.height).toBeLessThan(files.y);
  }
  for (const link of await page.locator(".downloads-file").all()) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test("unknown systems use the downloads route from the hero, header and footer", async ({
  page
}) => {
  await page.goto("/?os=other", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="hero-dl"]')).toHaveAttribute("href", "#/downloads");
  await expect(page.locator('[data-testid="hdr-dl"]')).toHaveAttribute("href", "#/downloads");
  await expect(page.locator(".ftr").getByRole("link", { name: "Downloads" })).toHaveAttribute(
    "href",
    "#/downloads"
  );
  await page.locator('[data-testid="hero-dl"]').click();
  await expect(page.locator(".downloads-system.detected")).toHaveCount(0);
  await expect(page.locator('[data-testid="download-detection"]')).toContainText("desktop app");
  await expect(page.locator(".downloads-file")).toHaveCount(8);
});

for (const [name, ua, touches, hintedPlatform] of [
  ["iPhone", IPHONE_UA, 5, "macOS"],
  ["desktop-mode iPad", IPAD_DESKTOP_UA, 5, "macOS"],
  ["unknown browser", "Mystery Browser", 0, ""],
  ["ChromeOS", "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/131", 0, "Linux"],
  ["FreeBSD", "Mozilla/5.0 (X11; FreeBSD amd64) Firefox/130", 0, ""]
] as const) {
  test(`${name} never gets a false desktop highlight`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.addInitScript(
      ({ ua, touches, hintedPlatform }) => {
        Object.defineProperty(navigator, "userAgent", { configurable: true, value: ua });
        Object.defineProperty(navigator, "maxTouchPoints", { configurable: true, value: touches });
        Object.defineProperty(navigator, "userAgentData", {
          configurable: true,
          value: hintedPlatform
            ? {
                getHighEntropyValues: async () => ({
                  platform: hintedPlatform,
                  architecture: "arm"
                })
              }
            : undefined
        });
      },
      { ua, touches, hintedPlatform }
    );
    await page.goto("/#/downloads", { waitUntil: "networkidle" });
    await expect(page.locator(".downloads-system")).toHaveCount(3);
    await expect(page.locator(".downloads-system.detected")).toHaveCount(0);
    await expect(page.locator(".downloads-badge")).toHaveCount(0);
    await expect(page.locator(".downloads-file")).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320
    );
  });
}

test("an unsupported ARM desktop is not sent straight to an x64 installer", async ({ page }) => {
  await page.goto("/?os=windows&arch=arm64", { waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="hero-dl"]')).toHaveAttribute("href", "#/downloads");
  await expect(page.locator('[data-testid="hdr-dl"]')).toHaveAttribute("href", "#/downloads");
  await page.getByRole("link", { name: "Other systems" }).click();
  await expect(page.locator('.downloads-system[data-os="windows"]')).toHaveClass(/detected/);
  await expect(page.locator(".downloads-arch-note")).toBeVisible();
});

test("a chosen Mac chip stays consistent across the direct download links", async ({ page }) => {
  await page.goto("/?os=mac", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("mareader-mac-arch", "x64"));
  await page.reload({ waitUntil: "networkidle" });
  const direct = page.locator(
    '[data-testid="hero-dl"], [data-testid="hdr-dl"], [data-testid="dl-main"]'
  );
  await expect(direct).toHaveCount(3);
  for (const link of await direct.all()) await expect(link).toHaveAttribute("href", /x64\.dmg$/);
  await page.getByRole("radio", { name: "Apple Silicon" }).click();
  for (const link of await direct.all())
    await expect(link).toHaveAttribute("href", /aarch64\.dmg$/);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('[data-testid="hero-dl"]')).toHaveAttribute("href", /aarch64\.dmg$/);
});

test("keyboard users can open guidance and choose a file", async ({ page }) => {
  await page.goto("/?os=windows#/downloads", { waitUntil: "networkidle" });
  const system = page.locator('.downloads-system[data-os="windows"]');
  const summary = system.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(system.locator("details")).toHaveAttribute("open", "");
  await expect(system.locator("details p")).toContainText("SmartScreen");

  const installer = system.locator('[data-kind="win-exe"]');
  await installer.focus();
  await expect(installer).toBeFocused();
  await page.route("https://github.com/codewiththiha/mareader2/releases/download/**", (route) =>
    route.fulfill({ status: 200, body: "test installer" })
  );
  const requested = page.waitForRequest((request) => /-setup\.exe$/.test(request.url()));
  await page.keyboard.press("Enter");
  expect((await requested).url()).toMatch(/-setup\.exe$/);
});

test("a manually selected file really requests its download URL", async ({ page }) => {
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  await page.route("https://github.com/codewiththiha/mareader2/releases/download/**", (route) =>
    route.fulfill({ status: 200, body: "test installer" })
  );
  const requested = page.waitForRequest((request) => /_en-US\.msi$/.test(request.url()));
  await page.locator('[data-kind="win-msi"]').click();
  expect((await requested).url()).toMatch(/_en-US\.msi$/);
});

test("new live releases show every known and unrecognized file", async ({ page }) => {
  await page.route(API, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          draft: false,
          tag_name: "v9.9.9",
          published_at: "2026-11-10T12:00:00Z",
          body: "A test release.",
          assets: [
            {
              name: "Mareader_9_aarch64.dmg",
              size: 2000,
              browser_download_url: "https://example.test/Mareader_9_aarch64.dmg"
            },
            {
              name: "Mareader_alt_aarch64.dmg",
              size: 3000,
              browser_download_url: "https://example.test/Mareader_alt_aarch64.dmg"
            },
            {
              name: "new-arm-build.tar.zst",
              size: 4000,
              browser_download_url: "https://example.test/new-arm-build.tar.zst"
            },
            {
              name: "SHA256SUMS",
              size: 730,
              browser_download_url: "https://example.test/SHA256SUMS"
            }
          ]
        }
      ])
    })
  );
  await page.goto("/?os=other#/downloads", { waitUntil: "networkidle" });
  await expect(page.locator(".downloads-release")).toContainText("v9.9.9");
  await expect(page.locator('[data-kind="mac-arm"]')).toHaveCount(2);
  await expect(page.getByRole("link", { name: /new-arm-build\.tar\.zst/ })).toHaveAttribute(
    "href",
    "https://example.test/new-arm-build.tar.zst"
  );
  await expect(page.getByRole("link", { name: /SHA-256 checksums/ })).toHaveAttribute(
    "href",
    "https://example.test/SHA256SUMS"
  );
  await expect(page.locator(".downloads-empty")).toHaveCount(2);
});
