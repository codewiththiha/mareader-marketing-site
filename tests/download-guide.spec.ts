import { test, expect, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";

const API = "https://api.github.com/repos/codewiththiha/mareader/releases?per_page=30";
const COMMAND = "xattr -d com.apple.quarantine /Applications/Mareader.app";
const FIXTURE = "download fixture";
let server: Server;
let fixtureOrigin: string;

test.beforeAll(async () => {
  server = createServer((_request, response) => {
    response.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="mareader-test-installer"'
    });
    response.end(FIXTURE);
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Fixture server did not start");
  fixtureOrigin = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test.beforeEach(async ({ page }) => {
  await page.route(API, (route) => route.abort());
});

async function download(page: Page, link: Locator, keyboard = false) {
  const original = new URL(await link.evaluate((element: HTMLAnchorElement) => element.href));
  expect(["https://github.com", fixtureOrigin]).toContain(original.origin);
  expect(original.pathname).toContain("/codewiththiha/mareader/releases/download/");
  await link.evaluate((element: HTMLAnchorElement, origin) => {
    element.href = origin + new URL(element.href).pathname;
  }, fixtureOrigin);
  if (keyboard) await link.focus();
  const [file] = await Promise.all([
    page.waitForEvent("download", { timeout: 10_000 }),
    keyboard ? page.keyboard.press("Enter") : link.click()
  ]);
  expect(new URL(file.url()).pathname).toBe(original.pathname);
  expect(await file.failure()).toBeNull();
  expect(await readFile((await file.path())!, "utf8")).toBe(FIXTURE);
}

test("the Mac download starts and offers the exact command with a working copy button", async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as Window & { copiedCommand?: string }).copiedCommand = value;
        }
      }
    });
  });
  await page.goto("/?os=mac&arch=arm64", { waitUntil: "networkidle" });
  const trigger = page.getByTestId("hero-dl");
  await trigger.focus();
  await download(page, trigger);
  const dialog = page.getByRole("dialog", { name: "A little Mac heads-up." });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toContainText("Applications folder");
  await expect(dialog).toContainText("Open Anyway");
  await expect(dialog).toContainText("damaged");
  await expect(dialog).toContainText("can’t afford Apple’s Developer ID");
  await expect(dialog).toContainText("donation");
  await expect(dialog.locator("code")).toHaveText(COMMAND);
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await dialog.getByRole("button", { name: "Copy command" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as Window & { copiedCommand?: string }).copiedCommand))
    .toBe(COMMAND);
  await expect(dialog.getByRole("button", { name: "Copied" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
});

test("the selected Windows installer gets Windows guidance even on a Mac", async ({ page }) => {
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  const trigger = page.locator('[data-kind="win-arm-exe"]');
  await download(page, trigger);
  const dialog = page.getByRole("dialog", { name: "A little Windows heads-up." });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Windows protected your PC");
  await expect(dialog).toContainText("More info");
  await expect(dialog).toContainText("Run anyway");
  await expect(dialog).toContainText("donation");
  await expect(dialog.locator("code")).toHaveCount(0);
  await dialog.getByRole("button", { name: "Got it, thanks" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/#\/downloads$/);
});

for (const [name, url, selector, expected] of [
  ["header", "/?os=windows", '[data-testid="hdr-dl"]', "Windows"],
  ["home closing card", "/?os=mac", '[data-testid="dl-main"]', "Mac"],
  [
    "latest release",
    "/?os=mac#/releases",
    '.rel-desktop [data-testid="rel-latest-download"]',
    "Mac"
  ],
  ["manual Mac file on Windows", "/?os=windows#/downloads", '[data-kind="mac-intel"]', "Mac"],
  [
    "manual Mac file on an unknown system",
    "/?os=other#/downloads",
    '[data-kind="mac-intel"]',
    "Mac"
  ]
] as const) {
  test(`${name} download opens the right guide`, async ({ page }) => {
    await page.goto(url, { waitUntil: "networkidle" });
    const link = page.locator(selector);
    await download(page, link);
    const dialog = page.getByRole("dialog", { name: `A little ${expected} heads-up.` });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
}

test("an archived Windows installer also gets a guide", async ({ page }) => {
  await page.goto("/?os=other#/releases", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /v0\.0\.5/ }).click();
  const file = page.getByRole("tabpanel").locator('.rel-file[title$="_en-US.msi"]');
  await download(page, file);
  await expect(page.getByRole("dialog", { name: "A little Windows heads-up." })).toBeVisible();
});

test("keyboard activation starts the installer and opens its guide", async ({ page }) => {
  await page.goto("/?os=windows#/downloads", { waitUntil: "networkidle" });
  const trigger = page.locator('[data-kind="win-msi"]');
  await download(page, trigger, true);
  const dialog = page.getByRole("dialog", { name: "A little Windows heads-up." });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("mobile release downloads open the guide for the chosen file", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?os=windows#/releases", { waitUntil: "networkidle" });
  await download(page, page.locator('.rel-mobile [data-testid="rel-latest-download"]'));
  await expect(page.getByRole("dialog", { name: "A little Windows heads-up." })).toBeVisible();
  await page.keyboard.press("Escape");
  await page.locator(".rel-mobile-trigger").filter({ hasText: "v0.0.5" }).click();
  await download(page, page.locator('.rel-mobile .rel-file[title$="aarch64.dmg"]'));
  await expect(page.getByRole("dialog", { name: "A little Mac heads-up." })).toBeVisible();
});

test("extra release assets only open a guide for a Mareader installer", async ({ page }) => {
  const names = ["Mareader_9.pkg", "mareader_9_arm64.msi", "helper.exe", "README.txt"];
  await page.route(API, (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify([
        {
          draft: false,
          tag_name: "v9.9.9",
          published_at: "2026-11-10T12:00:00Z",
          body: "A test release.",
          assets: names.map((name) => ({
            name,
            size: 2000,
            browser_download_url: `https://github.com/codewiththiha/mareader/releases/download/v9.9.9/${name}`
          }))
        }
      ])
    })
  );
  await page.goto("/?os=other#/downloads", { waitUntil: "networkidle" });
  for (const [name, os] of [
    ["Mareader_9.pkg", "Mac"],
    ["mareader_9_arm64.msi", "Windows"]
  ]) {
    const link = page.locator(".downloads-extra").filter({ hasText: name });
    await download(page, link);
    await expect(page.getByRole("dialog", { name: `A little ${os} heads-up.` })).toBeVisible();
    await page.keyboard.press("Escape");
  }
  for (const name of ["helper.exe", "README.txt"]) {
    const link = page.locator(".downloads-extra").filter({ hasText: name });
    await expect(link).not.toHaveAttribute("data-download-guide");
    await download(page, link);
    await expect(page.locator("dialog.download-guide")).toBeHidden();
  }
});

test("Linux downloads, PKGBUILD and checksums never open a guide", async ({ page }) => {
  await page.goto("/?os=linux", { waitUntil: "networkidle" });
  await download(page, page.getByTestId("hero-dl"));
  const dialog = page.locator("dialog.download-guide");
  await expect(dialog).toBeHidden();
  await page.getByRole("link", { name: "Other systems" }).click();
  const historyLength = await page.evaluate(() => history.length);
  for (const kind of ["linux-deb", "linux-arm-appimage", "linux-arch", "linux-pkgbuild"]) {
    await download(page, page.locator(`[data-kind="${kind}"]`));
    await expect(dialog).toBeHidden();
  }
  await download(page, page.getByRole("link", { name: /SHA-256 checksums/ }));
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => history.length)).toBe(historyLength);
});

test("keyboard focus stays inside, and both the close button and backdrop dismiss", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  const trigger = page.locator('[data-kind="mac-arm"]');
  await download(page, trigger);
  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close first-launch guide" });
  const done = dialog.getByRole("button", { name: "Got it, thanks" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(done).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog[open]"))).toBe(true);
  }
  await close.click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await download(page, trigger);
  await expect(dialog).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("closing restores the previous scroll lock and page position", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?os=mac", { waitUntil: "networkidle" });
  const trigger = page.getByTestId("dl-main");
  await trigger.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(trigger).toBeInViewport({ ratio: 1 });
  await page.evaluate(() => (document.documentElement.style.overflow = "scroll"));
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(500);
  await download(page, trigger);
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.download-guide")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("scroll");
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - before)).toBeLessThanOrEqual(1);
  await expect(trigger).toBeFocused();
});

test("browser Back closes the guide before leaving the current page", async ({ page }) => {
  await page.goto("/?os=mac", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Other systems" }).click();
  const downloadsUrl = page.url();
  await download(page, page.locator('[data-kind="mac-arm"]'));
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.goBack();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(downloadsUrl);
  await page.goForward();
  await expect(dialog).toBeVisible();
  await page.goBack();
  await expect(dialog).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\?os=mac$/);
});

test("the donation link closes the guide and opens support without a history trap", async ({
  page
}) => {
  await page.goto("/?os=windows#/downloads", { waitUntil: "networkidle" });
  await download(page, page.locator('[data-kind="win-exe"]'));
  const dialog = page.getByRole("dialog");
  const donation = dialog.getByRole("link", { name: /a donation would mean a lot/ });
  await expect(donation).toHaveAttribute("href", "#/support");
  await donation.click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/#\/support$/);
  await expect(page.getByRole("heading", { name: "Support Mareader" })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/#\/downloads$/);
  await expect(dialog).toBeHidden();
});

test("the copy fallback works inside the modal when clipboard access is refused", async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async () => Promise.reject(new Error("blocked")) }
    });
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: (command: string) => {
        const active = document.activeElement as HTMLTextAreaElement | null;
        (window as Window & { fallbackCopy?: string; fallbackInDialog?: boolean }).fallbackCopy =
          active?.value;
        (
          window as Window & { fallbackCopy?: string; fallbackInDialog?: boolean }
        ).fallbackInDialog = !!active?.closest("dialog[open]");
        return command === "copy";
      }
    });
  });
  await page.goto("/?os=mac#/downloads", { waitUntil: "networkidle" });
  await download(page, page.locator('[data-kind="mac-arm"]'));
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Copy command" }).click();
  const result = await page.evaluate(() => ({
    copied: (window as Window & { fallbackCopy?: string }).fallbackCopy,
    inside: (window as Window & { fallbackInDialog?: boolean }).fallbackInDialog
  }));
  expect(result).toEqual({ copied: COMMAND, inside: true });
  await expect(dialog.getByRole("button", { name: "Copied" })).toBeFocused();
});

for (const theme of ["light", "dark"] as const) {
  test(`the Mac guide fits a small phone in ${theme} mode`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/?os=other#/downloads", { waitUntil: "networkidle" });
    if (
      theme === "dark" &&
      !(await page.locator("html").evaluate((root) => root.classList.contains("dark")))
    ) {
      await page.getByRole("button", { name: "Switch to dark theme" }).click();
    }
    await download(page, page.locator('[data-kind="mac-intel"]'));
    const dialog = page.getByRole("dialog");
    const bounds = (await dialog.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(8);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(312);
    expect(bounds.y).toBeGreaterThanOrEqual(8);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(632);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320
    );
    const scroll = dialog.locator(".guide-scroll");
    expect(await scroll.evaluate((node) => node.scrollHeight > node.clientHeight)).toBe(true);
    await scroll.evaluate((node) => (node.scrollTop = node.scrollHeight));
    await expect(dialog.getByRole("button", { name: "Close first-launch guide" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Got it, thanks" })).toBeVisible();
    await dialog.getByRole("button", { name: "Close first-launch guide" }).click();
    await expect(dialog).toBeHidden();
  });
}
