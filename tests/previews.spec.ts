import { test, expect } from "@playwright/test";

test("the hero fills the first viewport without scroll prompts", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const text of [
    "A LITTLE MORE ROOM TO READ",
    "A CLOSER LOOK",
    "Scroll at your own pace. Each little preview starts when you arrive.",
    "Take a look around",
    "Scroll to explore"
  ]) {
    await expect(page.getByText(text, { exact: true })).toHaveCount(0);
  }
  for (const { width, height } of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 }
  ]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(() => window.scrollTo(0, 0));
    const bounds = await page.evaluate(() => ({
      heroBottom: document.querySelector(".home-hero")!.getBoundingClientRect().bottom,
      showcaseTop: document.querySelector(".showcase")!.getBoundingClientRect().top,
      firstPreviewTop: document.querySelector(".preview-card")!.getBoundingClientRect().top,
      viewportHeight: window.innerHeight
    }));
    expect(bounds.heroBottom).toBeGreaterThanOrEqual(bounds.viewportHeight - 1);
    expect(bounds.showcaseTop).toBeGreaterThanOrEqual(bounds.viewportHeight - 1);
    expect(bounds.firstPreviewTop).toBeGreaterThan(bounds.viewportHeight);
  }
  await page.locator('[data-preview="appearance"]').scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.getByRole("heading", { name: "Limitless themes." })).toBeVisible();
});

test("the hero has no backdrop or gradient and keeps its responsive split layout", async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  const backgrounds = await page.locator(".home-hero").evaluate((hero) => {
    return [hero, ...hero.querySelectorAll("*")].flatMap((element) =>
      [null, "::before", "::after"].map(
        (pseudo) => getComputedStyle(element, pseudo).backgroundImage
      )
    );
  });
  expect(backgrounds.every((background) => !/gradient/i.test(background))).toBe(true);
  async function assertNoBackdrop() {
    const visual = await page.locator(".hero-visual").evaluate((element) => ({
      background: getComputedStyle(element).backgroundColor,
      beforeContent: getComputedStyle(element, "::before").content,
      beforeBackground: getComputedStyle(element, "::before").backgroundColor,
      afterContent: getComputedStyle(element, "::after").content
    }));
    expect(visual.background).toBe("rgba(0, 0, 0, 0)");
    expect(visual.beforeContent).toMatch(/^(none|normal)$/);
    expect(visual.beforeBackground).toBe("rgba(0, 0, 0, 0)");
    expect(visual.afterContent).toMatch(/^(none|normal)$/);
  }
  await assertNoBackdrop();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await assertNoBackdrop();
  const desktopCopy = (await page.locator(".hero-copy").boundingBox())!;
  const desktopArt = (await page.locator(".hero-art").boundingBox())!;
  expect(desktopCopy.x + desktopCopy.width).toBeLessThan(desktopArt.x);

  await page.setViewportSize({ width: 390, height: 844 });
  await assertNoBackdrop();
  const mobileCopy = (await page.locator(".hero-copy").boundingBox())!;
  const mobileArt = (await page.locator(".hero-art").boundingBox())!;
  expect(mobileCopy.y + mobileCopy.height).toBeLessThan(mobileArt.y);
});

test("navigation floats without a bar and keeps frosted pill controls", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator(".hdr-wash")).toHaveCount(0);
  await expect(page.locator(".hdr")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator(".hdr .pill.bare")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const releases = page.locator(".hdr").getByRole("link", { name: "Releases" });
  const glass = await releases.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    blur: getComputedStyle(element).backdropFilter,
    supported: CSS.supports("backdrop-filter", "blur(1px)")
  }));
  expect(glass.background).not.toBe("rgba(0, 0, 0, 0)");
  if (glass.supported) expect(glass.blur).toContain("blur");

  await page.locator('[data-preview="panes"]').evaluate((element) => {
    window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 8);
  });
  await releases.click();
  await expect(page).toHaveURL(/#\/releases/);
});

test("the four-pane hero adapts to screen size and theme", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/", { waitUntil: "networkidle" });
  const hero = page.getByRole("img", { name: /Four reading panes open/ });
  const currentSrc = () => hero.evaluate((image: HTMLImageElement) => image.currentSrc);
  const height = () => hero.evaluate((image: HTMLImageElement) => image.naturalHeight);

  await expect.poll(currentSrc).toMatch(/\/demos\/hero-light\.jpg$/);
  await expect.poll(height).toBe(640);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect.poll(currentSrc).toMatch(/\/demos\/hero-dark\.jpg$/);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(currentSrc).toMatch(/\/demos\/hero-mobile-dark\.jpg$/);
  await expect.poll(height).toBe(768);
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect.poll(currentSrc).toMatch(/\/demos\/hero-mobile-light\.jpg$/);
  await expect.poll(height).toBe(768);
});

test("borderless previews alternate beside their descriptions and stack on phones", async ({
  page
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const selector of [".hero-visual", ".hero-art", ".preview-card", ".preview-screen"]) {
    const element = page.locator(selector).first();
    await expect(element).toHaveCSS("border-top-width", "0px");
    await expect(element).toHaveCSS("padding-top", "0px");
    await expect(element).toHaveCSS("box-shadow", "none");
  }
  const rows = page.locator(".feature-row");
  await expect(rows).toHaveCount(5);
  for (let index = 0; index < 5; index++) {
    const row = rows.nth(index);
    const copy = (await row.locator(".feature-copy").boundingBox())!;
    const media = (await row.locator(".preview-card").boundingBox())!;
    if (index % 2 === 0) expect(media.x + media.width).toBeLessThan(copy.x);
    else expect(copy.x + copy.width).toBeLessThan(media.x);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (let index = 0; index < 5; index++) {
    const row = rows.nth(index);
    const copy = (await row.locator(".feature-copy").boundingBox())!;
    const media = (await row.locator(".preview-card").boundingBox())!;
    expect(copy.y + copy.height).toBeLessThan(media.y);
  }
});

test("previews load and restart only when in view", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const requested: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".mp4")) requested.push(request.url());
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const videos = page.locator(".preview-screen video");
  const first = videos.nth(0);
  const last = videos.nth(4);
  await expect(videos).toHaveCount(5);
  expect(requested).toEqual([]);
  expect(
    await first.evaluate((video: HTMLVideoElement) => ({
      controls: video.controls,
      loop: video.loop,
      muted: video.muted,
      playsInline: video.hasAttribute("playsinline"),
      rate: video.playbackRate,
      source: video.getAttribute("src")
    }))
  ).toEqual({
    controls: false,
    loop: true,
    muted: true,
    playsInline: true,
    rate: 1.12,
    source: null
  });

  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-play-state", "playing");
  await expect
    .poll(() => first.evaluate((video: HTMLVideoElement) => video.currentTime))
    .toBeGreaterThan(0.25);
  await expect(last).not.toHaveAttribute("src", /.+/);
  await first.evaluate((video: HTMLVideoElement) => {
    video.currentTime = video.duration - 0.15;
  });
  await expect
    .poll(() => first.evaluate((video: HTMLVideoElement) => video.currentTime))
    .toBeLessThan(1);

  await last.scrollIntoViewIfNeeded();
  await expect(last).toHaveAttribute("data-play-state", "playing");
  await expect(first).toHaveAttribute("data-play-state", "paused");
  await expect.poll(() => first.evaluate((video: HTMLVideoElement) => video.currentTime)).toBe(0);
  expect(await first.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);

  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-play-state", "playing");
  expect(await first.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeLessThan(1.5);
  await expect(last).toHaveAttribute("data-play-state", "paused");
});

test("every feature clip plays when its section is reached", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  for (const id of ["appearance", "panes", "dictionary", "models", "voice"]) {
    const video = page.locator(`[data-preview="${id}"] video`);
    await video.scrollIntoViewIfNeeded();
    await expect(video).toHaveAttribute("data-play-state", "playing");
    await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.videoWidth)).toBe(1024);
    await expect
      .poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime))
      .toBeGreaterThan(0.15);
  }
});

test("previews pause in hidden tabs and restart when visible", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const video = page.locator('[data-preview="appearance"] video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-play-state", "playing");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(video).toHaveAttribute("data-play-state", "paused");
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.currentTime)).toBe(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(video).toHaveAttribute("data-play-state", "playing");
});

test("reduced motion keeps the descriptive posters and downloads no video", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  const preview = page.locator('[data-preview="appearance"]');
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.locator("img")).toBeVisible();
  await expect(preview.locator("img")).toHaveAttribute("alt", /appearance settings/);
  await expect(preview.locator("video")).toHaveAttribute("data-play-state", "still");
  await expect(preview.locator("video")).not.toHaveAttribute("src", /.+/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(preview.locator("video")).toHaveAttribute("data-play-state", "playing");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(preview.locator("video")).toHaveAttribute("data-play-state", "still");
});

test("data saving keeps video previews as stills", async ({ page }) => {
  await page.addInitScript(() => {
    const connection = new EventTarget();
    Object.defineProperty(connection, "saveData", { value: true });
    Object.defineProperty(navigator, "connection", { configurable: true, value: connection });
  });
  await page.goto("/", { waitUntil: "networkidle" });
  const video = page.locator('[data-preview="appearance"] video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-play-state", "still");
  await expect(video).not.toHaveAttribute("src", /.+/);
});

test("older browsers without observers still reveal and play visible sections", async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", { configurable: true, value: undefined });
    Object.defineProperty(window, "ResizeObserver", { configurable: true, value: undefined });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  const video = page.locator('[data-preview="appearance"] video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveAttribute("data-play-state", "playing");
  await expect(page.locator(".pitch-head")).toHaveClass(/\bin\b/);
  expect(errors).toEqual([]);
});

test("the page fits narrow phones, tablets and desktop", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width
    );
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const voice = page.locator('[data-preview="voice"] video');
  await voice.scrollIntoViewIfNeeded();
  await expect(voice).toHaveAttribute("data-play-state", "playing");
});

test("touch-sized iPhone view plays the preview inline", async ({ browser, browserName }) => {
  test.skip(browserName === "firefox", "Firefox does not support mobile context emulation");
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1"
  });
  try {
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="hero-dl"]')).toHaveText(/Download free/);
    await page.setViewportSize({ width: 320, height: 640 });
    const buttons = page.locator(".hero-actions a");
    const primary = (await buttons.nth(0).boundingBox())!;
    const other = (await buttons.nth(1).boundingBox())!;
    expect(Math.abs(primary.y - other.y)).toBeLessThan(1);
    expect(primary.height).toBeGreaterThanOrEqual(44);
    expect(other.height).toBeGreaterThanOrEqual(44);
    const hero = (await page.locator(".hero-art").boundingBox())!;
    const showcase = (await page.locator(".showcase").boundingBox())!;
    expect(hero.y + hero.height).toBeLessThanOrEqual(640);
    expect(showcase.y).toBeGreaterThanOrEqual(639);

    const video = page.locator('[data-preview="dictionary"] video');
    await video.scrollIntoViewIfNeeded();
    await expect(video).toHaveAttribute("data-play-state", "playing");
    expect(await video.evaluate((node: HTMLVideoElement) => node.hasAttribute("playsinline"))).toBe(
      true
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320
    );
  } finally {
    await context.close();
  }
});
