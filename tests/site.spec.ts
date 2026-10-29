import { expect, test, type Page } from '@playwright/test';

/** Pretend to be a given system for the length of one page. */
async function asSystem(page: Page, platform: string, mobile = false): Promise<void> {
  await page.addInitScript(
    ({ platform, mobile }) => {
      Object.defineProperty(navigator, 'userAgentData', {
        configurable: true,
        value: { platform, mobile, brands: [] },
      });
    },
    { platform, mobile },
  );
}

test('the hero offers this machine’s file, and nothing else first', async ({ page, isMobile }) => {
  // A phone has no desktop build to offer, and says so instead of guessing.
  test.skip(!!isMobile, 'phones get the whole list, not one file');
  // Playwright's Chrome profile claims Windows, so name the system outright.
  await asSystem(page, 'Linux');
  await page.goto('/');

  const button = page.getByRole('link', { name: 'Download for Linux' });
  await expect(button).toHaveAttribute('href', /mareader_0\.0\.5_amd64\.deb$/);
  await expect(page.getByText('your machine', { exact: true })).toBeVisible();
  // The Intel switch belongs to Macs only.
  await expect(page.getByRole('button', { name: 'Intel' })).toHaveCount(0);
});

test('the header offers the same file as the hero', async ({ page, isMobile }) => {
  // Below 420 px the header's button is hidden; the hero's is the one there.
  test.skip(!!isMobile, 'the header button is hidden on a phone');
  await asSystem(page, 'Linux');
  await page.goto('/');

  const header = page.getByRole('banner').getByRole('link', { name: 'Download' });
  const hero = page.getByRole('link', { name: 'Download for Linux' });
  await expect(header).toHaveAttribute('href', /mareader_0\.0\.5_amd64\.deb$/);
  await expect(hero).toHaveAttribute('href', /mareader_0\.0\.5_amd64\.deb$/);
});

test('a Windows visitor is offered the installer', async ({ page }) => {
  await asSystem(page, 'Windows');
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Download for Windows' })).toHaveAttribute(
    'href',
    /mareader_0\.0\.5_x64-setup\.exe$/,
  );
});

test('a Mac visitor is asked which processor, and the file follows the answer', async ({
  page,
}) => {
  await asSystem(page, 'macOS');
  await page.goto('/');

  const intel = page.getByRole('button', { name: 'Intel' });
  await expect(intel).toHaveAttribute('aria-pressed', 'false');
  // Apple silicon is the default guess on a Mac, and the notes say why.
  await expect(page.getByRole('link', { name: 'Download for macOS' })).toHaveAttribute(
    'href',
    /aarch64\.dmg$/,
  );

  await intel.click();
  await expect(intel).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Download for macOS' })).toHaveAttribute(
    'href',
    /_x64\.dmg$/,
  );
});

test('the theme switch paints, remembers, and announces itself', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Switch to the (dark|light) theme/ });
  const before = await page.locator('html').getAttribute('data-theme');

  await toggle.click();
  const after = await page.locator('html').getAttribute('data-theme');
  expect(after).not.toBe(before);
  await expect(page.locator('html')).toHaveAttribute('data-theme', after!);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', after!);
});

test('the backdrop blends into the page, and back', async ({ page }) => {
  await page.goto('/');
  const frame = page.locator('.lab__blend .frame');
  const page_ = page.locator('.lab__blend .page');
  const paper = await page_.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(await frame.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(paper);

  const blend = page.getByRole('switch', { name: 'Blend mode' });
  await expect(blend).toHaveAttribute('aria-checked', 'false');
  await blend.click();
  await expect(blend).toHaveAttribute('aria-checked', 'true');

  // On, the backdrop takes the page's own colour; the page loses its shadow.
  await expect(frame).toHaveCSS('background-color', paper);
  await expect(page_).toHaveCSS('box-shadow', 'none');

  await blend.click();
  await expect(frame).not.toHaveCSS('background-color', paper);
});

test('the drawing wears the title bar of the system asking', async ({ page }) => {
  await asSystem(page, 'macOS');
  await page.goto('/');
  const win = page.locator('.hero__window .window');
  await expect(win).toHaveAttribute('data-os', 'macos');
  // Traffic lights, and no Windows captions on the right.
  await expect(win.locator('.lights i')).toHaveCount(3);
  await expect(win.locator('.captions')).toHaveCount(0);

  await asSystem(page, 'Windows');
  await page.goto('/');
  await expect(page.locator('.hero__window .window')).toHaveAttribute('data-os', 'windows');
  await expect(page.locator('.hero__window .window .captions')).toHaveCount(1);
});

test('the appearance controls repaint the window drawing', async ({ page }) => {
  await page.goto('/');
  const sheet = page.locator('.lab__window .sheet').first();
  const before = await sheet.evaluate((node) => getComputedStyle(node).backgroundColor);

  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.waitForTimeout(400);
  const after = await sheet.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(after).not.toBe(before);

  // The summary repeats what is chosen, for anyone not looking at the drawing.
  await expect(page.getByText('Dark · Sepia · Paper')).toBeVisible();
});

test('routes change without a reload, and Back returns', async ({ page }) => {
  await page.goto('/');
  // The footer links are the ones both viewports show.
  const notes = page.getByRole('navigation', { name: 'Footer' }).getByRole('link', {
    name: 'Release notes',
  });
  await notes.click();

  await expect(page).toHaveURL(/\/releases$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Release notes' })).toBeVisible();
  await expect(notes).toHaveAttribute('aria-current', 'page');

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('out of the way');
});

test('a deep link opens the page it names', async ({ page }) => {
  // What the 404.html shim hands the app: the path in a query, restored on boot.
  await page.goto('/?p=/donate');
  await expect(page).toHaveURL(/\/donate$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Keep Mareader free.' })).toBeVisible();
});

test('an unknown address says so and offers the three that exist', async ({ page }) => {
  await page.goto('/nope');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('never printed');
  await expect(page.getByRole('link', { name: 'Release notes' }).first()).toBeVisible();
});

test('the donation page draws one code per address, and copies the address', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/donate');

  // Five families, five codes: the nine EVM networks share one address.
  await expect(page.locator('svg[role="img"]')).toHaveCount(5);
  await expect(page.getByRole('heading', { level: 2, name: 'EVM networks' })).toBeVisible();

  for (const family of ['EVM networks', 'Bitcoin', 'Tron', 'Solana', 'Stellar']) {
    await expect(page.getByRole('button', { name: `Copy ${family} address` })).toBeVisible();
  }

  const copy = page.getByRole('button', { name: 'Copy Bitcoin address' });
  await copy.click();
  await expect(page.getByRole('button', { name: 'Bitcoin address copied' })).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe('bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm');
});

test('picking an EVM network moves the explorer link, not the address', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/donate');

  const family = page.locator('article').filter({ hasText: 'EVM networks' });
  const evm = '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7';

  // Ethereum leads, because it is where a donation is most likely to start.
  await expect(family.getByRole('button', { name: 'Ethereum' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(family.getByRole('link', { name: /Etherscan/ })).toHaveAttribute(
    'href',
    `https://etherscan.io/address/${evm}`,
  );

  await family.getByRole('button', { name: 'BNB Chain' }).click();
  await expect(family.getByRole('button', { name: 'BNB Chain' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(family.getByRole('link', { name: /BscScan/ })).toHaveAttribute(
    'href',
    `https://bscscan.com/address/${evm}`,
  );

  // Nine networks, still one code and one address to copy.
  await expect(page.locator('svg[role="img"]')).toHaveCount(5);
  await family.getByRole('button', { name: 'Copy EVM networks address' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(evm);

  await family.getByRole('button', { name: 'Arc' }).click();
  await expect(family.getByRole('link', { name: /Arc Explorer/ })).toHaveAttribute(
    'href',
    `https://explorer.arc.io/address/${evm}`,
  );
});

test('the Myanmar view is one press away and says it is not ready', async ({ page }) => {
  await page.goto('/donate');
  await page.getByRole('tab', { name: 'Myanmar' }).click();

  await expect(page.getByRole('tab', { name: 'Myanmar' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { level: 2, name: 'KBZPay' })).toBeVisible();
  await expect(page.getByText('Coming soon').first()).toBeVisible();
  await expect(page.locator('svg[role="img"]')).toHaveCount(0);
});

test('a visitor in Myanmar is asked, once, and can decline', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'languages', {
      configurable: true,
      get: () => ['my-MM', 'en'],
    });
  });
  await page.goto('/donate');

  const prompt = page.getByText('Are you in Myanmar?');
  await expect(prompt).toBeVisible();

  await page.getByRole('button', { name: 'Show local methods' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Wave Pay' })).toBeVisible();

  // Declining leaves the crypto view alone and the question gone.
  await page.getByRole('tab', { name: 'Crypto' }).click();
  await expect(prompt).toBeVisible();
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(prompt).toBeHidden();
});

test('the small-screen menu opens, navigates and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'Open the menu' });
  await menu.click();
  await expect(page.getByRole('button', { name: 'Close the menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );

  await page
    .getByRole('navigation', { name: 'Menu' })
    .getByRole('link', { name: 'Donate' })
    .click();
  await expect(page).toHaveURL(/\/donate$/);
  // Choosing a page closes the menu, so the next press opens it again.
  await expect(page.getByRole('button', { name: 'Open the menu' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Menu' })).toHaveCount(0);
});

test('every page has one h1 and its title names the route', async ({ page }) => {
  for (const [path, title] of [
    ['/', /a calm reader/],
    ['/releases', /Release notes/],
    ['/donate', /Donate/],
  ] as const) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});
