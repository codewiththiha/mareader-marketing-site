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

// Kept in step with src/lib/content/donations.ts by hand: this tool must not
// import the page's own builder, or a bug in it would agree with itself.
const expected = [
  '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7',
  'bc1qg454fmqylphrzfqh2kvlq54dt8t2kqaz452wm',
  'FJKswEYdwJufp978ycwCcVbSVhZvrEnchoEbWcuKi1Zy',
  '0xFaC170C240dFC6419Ff8d9D8108E2e2D88f595d7',
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
    // 3× because jsQR wants ~6 pixels per module: a 47-module code drawn at
    // 148 CSS px has 3 px each, and a phone camera resolves far more than 2×.
    deviceScaleFactor: 3,
    colorScheme: theme,
  });
  await context.addInitScript((value) => localStorage.setItem('mareader.theme', value), theme);

  const page = await context.newPage();
  await page.goto(`${base}/donate`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const codes = page.locator('svg[role="img"]');
  const count = await codes.count();
  if (count !== expected.length) {
    console.log(`${theme}: found ${count} codes, expected ${expected.length}`);
    failures += 1;
  }

  for (let index = 0; index < count; index += 1) {
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
