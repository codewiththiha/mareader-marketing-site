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
    await expect(page.getByTestId("support-note")).toHaveCount(initial === "crypto" ? 1 : 0);
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
    await expect(page.getByTestId("support-note")).toHaveCount(initial === "crypto" ? 0 : 1);
    await expectMarkerOnSelected(page);
    await page.getByTestId("sup-flip").click();
    await expect(initial === "crypto" ? crypto : local).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("support-note")).toHaveCount(initial === "crypto" ? 1 : 0);
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

test("the maker's note appears only for crypto", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/?support=local#/support", { waitUntil: "networkidle" });
  const note = page.getByTestId("support-note");
  await expect(page.getByTestId("local-panel")).toBeVisible();
  await expect(note).toHaveCount(0);

  await page.getByRole("radio", { name: "Crypto" }).click();
  await expect(page.getByRole("region", { name: "Why crypto?" })).toBeVisible();
  await expect(note).toContainText("I live in Myanmar");
  await expect(note).toContainText("PayPal, Stripe");
  await expect(note).toContainText("support from readers abroad");
  await expect(note).toContainText("middle-class family in a developing country");
  await expect(note).toContainText("even a small donation helps");
  await expect(note).toContainText("No pressure, though");
  await expect(note.locator("p")).toHaveCount(4);
  const order = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="sup-panel"]')!;
    const story = document.querySelector('[data-testid="support-note"]')!;
    const footer = document.querySelector(".ftr")!;
    return Boolean(
      panel.compareDocumentPosition(story) & Node.DOCUMENT_POSITION_FOLLOWING &&
      story.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
  expect(order).toBe(true);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
    const box = (await note.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
  }

  await page.getByRole("radio", { name: "Myanmar" }).click();
  await expect(note).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Why crypto?" })).toHaveCount(0);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByTestId("local-panel")).toBeVisible();
  await expect(note).toHaveCount(0);
  await page.getByTestId("sup-flip").click();
  await expect(note).toBeVisible();
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
