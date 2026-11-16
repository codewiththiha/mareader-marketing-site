import { test, expect, type Page } from "@playwright/test";

const API = "https://api.github.com/repos/codewiththiha/mareader2/releases?per_page=30";

test.beforeEach(async ({ page }) => {
  await page.route(API, (route) => route.abort());
});

async function expectMarkerOnSelected(page: Page) {
  const group = page.getByRole("radiogroup", { name: "Donation method" });
  const selected = group.getByRole("radio", { checked: true });
  const mark = group.locator(".pill-mark");
  await expect
    .poll(async () => {
      const activeBox = await selected.boundingBox();
      const markBox = await mark.boundingBox();
      if (!activeBox || !markBox) return Infinity;
      return Math.max(Math.abs(activeBox.x - markBox.x), Math.abs(activeBox.width - markBox.width));
    })
    .toBeLessThanOrEqual(2);
}

for (const [width, theme, initial] of [
  [320, "dark", "local"],
  [320, "light", "crypto"],
  [390, "dark", "crypto"],
  [390, "light", "local"]
] as const) {
  test(`mobile ${width}px ${theme} theme shows both methods from ${initial}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/?support=${initial}#/support`, { waitUntil: "networkidle" });
    const group = page.getByRole("radiogroup", { name: "Donation method" });
    const crypto = group.getByRole("radio", { name: "Crypto" });
    const local = group.getByRole("radio", { name: "Myanmar" });
    await expect(crypto).toBeVisible();
    await expect(local).toBeVisible();
    await expect(crypto.locator(".pill-label")).toBeVisible();
    await expect(local.locator(".pill-label")).toBeVisible();
    expect((await crypto.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    expect((await local.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(initial === "crypto" ? crypto : local).toHaveAttribute("aria-checked", "true");
    await expectMarkerOnSelected(page);

    if (initial === "crypto") {
      await expect(page.getByTestId("wallet-evm")).toBeVisible();
      await local.click();
      await expect(local).toHaveAttribute("aria-checked", "true");
      await expect(page.getByTestId("local-panel")).toBeVisible();
      await expect(page.getByTestId("sup-flip")).toContainText("Prefer crypto?");
    } else {
      await expect(page.getByTestId("local-panel")).toBeVisible();
      await crypto.click();
      await expect(crypto).toHaveAttribute("aria-checked", "true");
      await expect(page.getByTestId("wallet-evm")).toBeVisible();
      await expect(page.getByTestId("sup-flip")).toContainText("Are you from Myanmar?");
    }
    await expectMarkerOnSelected(page);
    await page.getByTestId("sup-flip").click();
    await expect(initial === "crypto" ? crypto : local).toHaveAttribute("aria-checked", "true");
    await expectMarkerOnSelected(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
    const altBox = (await page.getByTestId("sup-flip").boundingBox())!;
    expect(altBox.x).toBeGreaterThanOrEqual(0);
    expect(altBox.x + altBox.width).toBeLessThanOrEqual(width);
  });
}

test("mobile methods work with the keyboard and persist across visits", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/?support=crypto#/support", { waitUntil: "networkidle" });
  const group = page.getByRole("radiogroup", { name: "Donation method" });
  const crypto = group.getByRole("radio", { name: "Crypto" });
  const local = group.getByRole("radio", { name: "Myanmar" });
  await crypto.focus();
  await page.keyboard.press("ArrowRight");
  await expect(local).toBeFocused();
  await expect(local).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("local-panel")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("sup-flip")).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("mareader-support-method")))
    .toBe("local");
  await page.goto("/#/support", { waitUntil: "networkidle" });
  await expect(local).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("local-panel")).toBeVisible();
});

test("resizing keeps the selection aligned while header navigation stays compact", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?support=local#/support", { waitUntil: "networkidle" });
  const group = page.getByRole("radiogroup", { name: "Donation method" });
  const local = group.getByRole("radio", { name: "Myanmar" });
  for (const width of [320, 559, 560, 768, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(local).toHaveAttribute("aria-checked", "true");
    await expect(local.locator(".pill-label")).toBeVisible();
    await expectMarkerOnSelected(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
  }
  await expect(page.locator(".hdr .pill-label").first()).toHaveCSS("display", "none");
  await expect(page.locator(".hdr").getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await expect(page.locator(".hdr").getByRole("link", { name: "Release notes" })).toBeVisible();
  await expect(page.locator(".hdr").getByRole("link", { name: "Support Mareader" })).toBeVisible();
});
