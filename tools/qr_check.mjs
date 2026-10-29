#!/usr/bin/env node
/**
 * Decode every donation code from a screenshot of the live page.
 *
 *   node tools/qr_check.mjs                 # light and dark
 *   node tools/qr_check.mjs --theme dark
 *
 * The addresses in `donations.ts` are the only truth this checks against: a code
 * that decodes to anything else — a rounded finder, an inverted symbol, a quiet
 * zone eaten by a border — is money sent nowhere. Run it after any change to
 * `qr.ts`, `QrCode.svelte` or the theme tokens.
 */

import { chromium } from 'playwright';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};

const base = flag('url', 'http://127.0.0.1:5173').replace(/\/$/, '');
const themes = flag('theme', 'light,dark').split(',');

// Copied from donations.ts by hand: one code per family, in card order.
const expected = [
  '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7',
  'bc1qg454fmqylphrzfqh2kdvlq54dt8t2kqaz452wm',
  'TGdk1Y2rsd2Rm1Nh79d7KSBDyNrRQ5Xhau',
  'FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy',
  'GBFFH6S4R2VFSU7O5YAB3IWCLEHMSLWNYSKEYKUNV5O7C5ZESHI63QVQ',
];

function decode(buffer) {
  const png = PNG.sync.read(buffer);
  const result = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  return result?.data ?? null;
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });
let failures = 0;

for (const theme of themes) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    // jsQR wants ~6 px per module; 148 CSS px over 47 modules needs 3×.
    deviceScaleFactor: 3,
    colorScheme: theme,
  });
  await context.addInitScript((value) => localStorage.setItem('mareader.theme', value), theme);

  const page = await context.newPage();
  try {
    await page.goto(`${base}/donate`, { waitUntil: 'networkidle' });
  } catch {
    console.error(`nothing is serving ${base}; run \`npm run dev\` or pass --url`);
    await browser.close();
    process.exit(2);
  }
  await page.evaluate(() => document.fonts.ready);

  const codes = page.locator('svg[role="img"]');
  const count = await codes.count();
  if (count !== expected.length) {
    console.log(`${theme}: found ${count} codes, expected ${expected.length}`);
    failures += 1;
  }

  for (let index = 0; index < count; index += 1) {
    // Below the fold the reveal still has it faded, so scroll first.
    await codes.nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(760);
    const shot = await codes.nth(index).screenshot();
    const decoded = decode(shot);
    const want = expected[index];
    if (decoded === want) {
      console.log(`${theme} #${index + 1}: decoded ${decoded.slice(0, 12)}…`);
    } else {
      console.log(`${theme} #${index + 1}: decoded ${decoded ?? 'nothing'}, expected ${want}`);
      failures += 1;
    }
  }

  await context.close();
}

await browser.close();
process.exit(failures ? 1 : 0);
