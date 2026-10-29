#!/usr/bin/env node
/**
 * Take the shots, and say what is wrong with the page while taking them.
 *
 *   node tools/shot.mjs                          # every route, both themes, three widths
 *   node tools/shot.mjs --paged --routes / --widths 1440   # viewport pieces, for looking
 *   node tools/shot.mjs --routes /,/donate       # only these
 *   node tools/shot.mjs --themes dark --widths 390
 *   node tools/shot.mjs --url http://127.0.0.1:4173
 *
 * Writes PNGs to shots/ and a report to shots/report.txt. The report is the
 * critic: console errors, failed requests, sideways overflow, elements wider
 * than the viewport, and axe's accessibility violations — the things a
 * screenshot alone will not tell you. Exit code 1 when it finds any of them,
 * so a gate can use it. `--no-audit` skips axe for a fast look.
 *
 * The dev server must already be running (`npm run dev`); this only visits.
 */

import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};

const base = flag('url', 'http://127.0.0.1:5173').replace(/\/$/, '');
const routes = flag('routes', '/,/releases,/donate').split(',').filter(Boolean);
const themes = flag('themes', 'light,dark').split(',');
const widths = flag('widths', '1440,834,390').split(',').map(Number);
const full = !args.includes('--viewport-only');
const paged = args.includes('--paged');
const audit = !args.includes('--no-audit');
const outDir = path.resolve('shots');

const names = { '/': 'home', '/releases': 'releases', '/donate': 'donate' };
const problems = [];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });

for (const theme of themes) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width < 600 ? 844 : 900 },
      deviceScaleFactor: 2,
      colorScheme: theme,
    });
    await context.addInitScript((value) => {
      localStorage.setItem('mareader.theme', value);
    }, theme);

    for (const route of routes) {
      const page = await context.newPage();
      const label = `${names[route] ?? route.replaceAll('/', '')}-${theme}-${width}`;
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(`${label}: console — ${message.text()}`);
      });
      page.on('pageerror', (error) => problems.push(`${label}: page error — ${error.message}`));
      page.on('requestfailed', (request) =>
        problems.push(`${label}: request failed — ${request.url()}`),
      );

      const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      if (!response || !response.ok()) {
        problems.push(`${label}: HTTP ${response ? response.status() : 'no response'}`);
      }

      await page.evaluate(() => document.fonts.ready);

      // The reveal observer needs a walk down the page, or the shot is empty.
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.7);
        // `instant`: the page scrolls smoothly, and that never arrives here.
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((resolve) => setTimeout(resolve, 90));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      // Then let the 620 ms reveal transitions finish and the canvases paint.
      await page.waitForTimeout(1100);

      const metrics = await page.evaluate(() => {
        const wide = [...document.querySelectorAll('body *')]
          .filter((node) => {
            const box = node.getBoundingClientRect();
            const style = getComputedStyle(node);
            // Off-screen on purpose (a skip link) is not overflow.
            if (box.right < 1 && style.position !== 'static') return false;
            if (style.clipPath === 'inset(50%)' || style.visibility === 'hidden') return false;
            return box.width > 0 && (box.right > window.innerWidth + 1 || box.left < -1);
          })
          .slice(0, 6)
          .map((node) => `${node.tagName.toLowerCase()}.${node.className || '—'}`);
        return {
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          wide,
          height: document.documentElement.scrollHeight,
        };
      });

      if (audit) {
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        for (const violation of results.violations) {
          const where = violation.nodes[0]?.target?.join(' ') ?? '—';
          problems.push(
            `${label}: a11y (${violation.impact}): ${violation.id} — ${violation.help} [${where}]`,
          );
        }
      }

      if (metrics.overflow > 1) {
        problems.push(`${label}: page scrolls sideways by ${metrics.overflow}px`);
      }
      for (const node of metrics.wide) {
        problems.push(`${label}: sits outside the viewport — ${node}`);
      }

      if (paged) {
        // Viewport-sized pieces, for looking at type and spacing at 100%.
        const step = await page.evaluate(() => window.innerHeight);
        const views = Math.ceil(metrics.height / step);
        for (let index = 0; index < views; index += 1) {
          await page.evaluate(
            (y) => window.scrollTo({ top: y, behavior: 'instant' }),
            index * step,
          );
          await page.waitForTimeout(220);
          const file = path.join(outDir, `${label}-v${index + 1}.png`);
          await page.screenshot({ path: file });
          console.log(
            `${label} view ${index + 1}/${views} → ${path.relative(process.cwd(), file)}`,
          );
        }
      } else {
        const file = path.join(outDir, `${label}.png`);
        await page.screenshot({ path: file, fullPage: full });
        console.log(`${label}  ${metrics.height}px tall  → ${path.relative(process.cwd(), file)}`);
      }
      await page.close();
    }

    await context.close();
  }
}

await browser.close();

const report = problems.length
  ? `${problems.length} issue(s)\n\n${problems.join('\n')}\n`
  : 'No console errors, failed requests or sideways overflow.\n';

await writeFile(path.join(outDir, 'report.txt'), report);
console.log(`\n${report}`);
process.exit(problems.length ? 1 : 0);
